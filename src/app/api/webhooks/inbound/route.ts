import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { adminDb } from '@/lib/firebase-admin';
import { extractTransaction } from '@/ai/flows/extract-transaction-flow';
import { dispatchWebhook } from '@/lib/webhook-sender';
import PostalMime from 'postal-mime';

export async function POST(req: NextRequest) {
  try {
    const secret = req.nextUrl.searchParams.get('secret');
    const expectedSecret = process.env.INBOUND_WEBHOOK_SECRET || 'pmh_super_secret_2026';

    if (!expectedSecret) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const to = body.to as string; 
    const rawEmail = body.rawEmail || body.text; 
    
    if (!to || !rawEmail) {
      return NextResponse.json({ error: 'Missing required fields (to, rawEmail)' }, { status: 400 });
    }

    let text = "";
    try {
      const parser = new PostalMime();
      const parsedEmail = await parser.parse(rawEmail);
      text = parsedEmail.text || parsedEmail.html || rawEmail;
    } catch (e) {
      text = rawEmail;
    }

    // =====================================================================
    // 0. LUỒNG HYBRID: TỰ ĐỘNG CLICK LINK & BÓC TÁCH OTP GMAIL FORWARDING
    // =====================================================================
    if (text.includes('mail.google.com/mail/f-') || text.includes('forwarding-noreply@google.com')) {
      let otpCode = null;
      let linkClicked = false;

      // Lấy UID từ địa chỉ email nhận (inbound+UID@omewa.vn)
      const uidMatch = to.match(/inbound\+([^@]+)@/i);
      const uid = uidMatch ? uidMatch[1] : null;

      // Hành động 1: Tìm và tự động Click Link xác nhận
      const confirmLinkMatch = text.match(/(https:\/\/mail\.google\.com\/mail\/f-[^\s"']+)/);
      if (confirmLinkMatch && confirmLinkMatch[1]) {
        try {
          const confirmUrl = confirmLinkMatch[1].replace(/&amp;/g, '&');
          await fetch(confirmUrl, { method: 'GET' });
          linkClicked = true;
          console.log(`[Gmail Forwarding] Auto-clicked link for: ${to}`);
        } catch (err) {
          console.error('[Gmail Forwarding] Auto-click link failed:', err);
        }
      }

      // Hành động 2: Bóc tách mã OTP (Confirmation code)
      const otpMatch = text.match(/(?:Mã xác nhận|Confirmation code)[\s:]*([0-9]{8,10})/i);
      if (otpMatch && otpMatch[1]) {
        otpCode = otpMatch[1];
      } else {
        const fallbackMatch = text.match(/\b([0-9]{8,10})\b/);
        if (fallbackMatch && fallbackMatch[1]) {
          otpCode = fallbackMatch[1];
        }
      }

      // Hành động 3: Lưu mã OTP vào Database để Frontend hiển thị cho User
      if (uid && otpCode) {
        try {
          // Ghi chú: Cần đảm bảo collection 'users' tồn tại
          await adminDb.collection('users').doc(uid).set({
            latestGmailForwardingOtp: otpCode,
            otpUpdatedAt: new Date().toISOString()
          }, { merge: true }); // Dùng set + merge để tạo mới nếu chưa có
          console.log(`[Gmail Forwarding] Saved OTP ${otpCode} for user ${uid}`);
        } catch (dbErr) {
          console.error(`[Gmail Forwarding] Failed to save OTP for user ${uid}:`, dbErr);
        }
      }

      // Trả về 200 OK để kết thúc luồng, không cho chạy tiếp xuống dưới
      return NextResponse.json({ 
        success: true, 
        message: 'Gmail forwarding processed (Hybrid)',
        linkClicked,
        otpExtracted: !!otpCode
      });
    }

    // =====================================================================
    // 1. LUỒNG XỬ LÝ THANH TOÁN NỘI BỘ (ADMIN NHẬN TIỀN NÂNG CẤP)
    // =====================================================================
    const sysSettingsSnap = await adminDb.collection('system_settings').doc('general').get();
    const sysSettings = sysSettingsSnap.data();
    const adminInboundEmail = sysSettings?.adminInboundEmail || '';

    if (adminInboundEmail && to.toLowerCase() === adminInboundEmail.toLowerCase()) {
      const upgradeMatch = text.match(/PMH\s+(PRO|ENTERPRISE)\s+([A-Z0-9]{8})/i);
      
      if (upgradeMatch) {
        const planName = upgradeMatch[1].toUpperCase();
        const shortUid = upgradeMatch[2].toUpperCase();
        
        const targetUsersSnap = await adminDb.collection('users')
          .where(admin.firestore.FieldPath.documentId(), '>=', shortUid)
          .where(admin.firestore.FieldPath.documentId(), '<=', shortUid + '\uf8ff')
          .limit(1)
          .get();

        if (!targetUsersSnap.empty) {
          const targetUserDoc = targetUsersSnap.docs[0];
          const newLimit = planName === 'PRO' ? 1000 : 999999;

          await targetUserDoc.ref.update({
            planName: planName === 'PRO' ? 'Pro' : 'Enterprise',
            transactionLimit: newLimit,
            updatedAt: new Date().toISOString()
          });

          return NextResponse.json({ success: true, message: `Upgraded user to ${planName}` });
        } else {
          return NextResponse.json({ success: true, message: 'Upgrade failed: User not found' });
        }
      }
      return NextResponse.json({ success: true, message: 'Admin email received but no upgrade syntax found' });
    }

    // =====================================================================
    // 2. LUỒNG XỬ LÝ WEBHOOK CHO CUSTOMER (KHÁCH HÀNG NHẬN TIỀN)
    // =====================================================================
    const uidMatch = to.match(/inbound\+([^@]+)@/i);
    if (!uidMatch || !uidMatch[1]) {
      return NextResponse.json({ error: 'Invalid routing address' }, { status: 400 });
    }
    
    const uid = uidMatch[1];
    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();

    if (!userData || (userData.transactionCount >= userData.transactionLimit)) {
      return NextResponse.json({ success: false, message: 'Transaction limit reached' }, { status: 403 });
    }

    const webhookConfigSnap = await adminDb.collection('users').doc(uid).collection('webhookConfigurations').limit(1).get();
    const referencePrefix = webhookConfigSnap.empty ? 'TT' : webhookConfigSnap.docs[0].data().referencePrefix;

    try {
      const extractedData = await extractTransaction({
        emailBody: text,
        referencePrefix: referencePrefix
      });

      if (extractedData.referenceCode) {
        const webhookSuccess = await dispatchWebhook(uid, extractedData);
        if (webhookSuccess) {
          await userRef.update({
            transactionCount: admin.firestore.FieldValue.increment(1)
          });
        }
      }
    } catch (aiError) {
      return NextResponse.json({ success: true, message: 'Processed with AI errors' });
    }

    return NextResponse.json({ success: true, message: 'Email processed successfully' });

  } catch (error: any) {
    console.error('[Inbound Webhook Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}