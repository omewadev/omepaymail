import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { adminDb } from '@/lib/firebase-admin';
import { extractTransaction } from '@/ai/flows/extract-transaction-flow';
import { dispatchWebhook } from '@/lib/webhook-sender';
import PostalMime from 'postal-mime';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const maxDuration = 30; // Tăng thời gian chờ cho AI

export async function POST(req: NextRequest) {
  try {
    // =====================================================================
    // BẢO MẬT & PARSE EMAIL (GIỮ NGUYÊN 100%)
    // =====================================================================
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

    // Lấy UID từ địa chỉ email nhận (inbound+UID@omewa.vn)
    const uidMatch = to.match(/inbound\+([^@]+)@/i);
    const uid = uidMatch ? uidMatch[1] : null;

    // =====================================================================
    // LUỒNG XỬ LÝ THANH TOÁN NỘI BỘ (ADMIN NHẬN TIỀN NÂNG CẤP) - GIỮ NGUYÊN
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
    // TẦNG 1: LỌC EMAIL XÁC NHẬN (UNIVERSAL CONFIRMATION CATCHER)
    // =====================================================================
    // Nhận diện ý định xác nhận từ bất kỳ nhà cung cấp nào (Gmail, Outlook, Custom Server...)
    const isConfirmationIntent = text.match(/(forwarding-noreply|đã yêu cầu tự động chuyển tiếp|has requested to automatically forward|xác nhận|confirmation|verify)/i);
    
    if (isConfirmationIntent) {
      let linkClicked = false;
      let otpCode = null;

      // Hành động 1: Dùng AI đọc hiểu ngữ cảnh để tìm ĐÚNG link xác nhận (Tránh bẫy Link Hủy)
      let targetLink = null;
      try {
        const { output } = await ai.generate({
          prompt: `Đọc email sau. Tìm đường link HTTPS dùng để XÁC NHẬN (CONFIRM/APPROVE/VERIFY) yêu cầu chuyển tiếp email. TUYỆT ĐỐI BỎ QUA các link dùng để HỦY (CANCEL/DENY), link hỗ trợ (support), hoặc link ảnh. Trả về JSON chứa key "confirmUrl". Nếu không thấy, trả về null.\n\nNội dung Email:\n${text}`,
          output: { schema: z.object({ confirmUrl: z.string().nullable() }) }
        });
        targetLink = output?.confirmUrl;
      } catch (aiErr) {
        console.error('[Tier 1] AI failed to extract confirmation link:', aiErr);
        // Fallback an toàn: Nếu AI lỗi/quá tải, dùng Regex bắt cứng link 'vf-' (verify forward) của riêng Gmail
        const gmailSafeMatch = text.match(/(https:\/\/mail-settings\.google\.com\/mail\/vf-[^\s"<>]+)/);
        if (gmailSafeMatch) targetLink = gmailSafeMatch[1];
      }

      if (targetLink) {
        try {
          const confirmUrl = targetLink.replace(/&amp;/g, '&');
          await fetch(confirmUrl, { method: 'GET', signal: AbortSignal.timeout(8000) });
          linkClicked = true;
          console.log(`[Tier 1] Auto-clicked AI-verified link: ${confirmUrl}`);
        } catch (err) {
          console.error('[Tier 1] Auto-click link failed:', err);
        }
      }

      // Hành động 2: Bóc tách mã OTP (Giữ nguyên logic Regex mạnh mẽ)
      const otpMatch = text.match(/(?:Mã xác nhận|Confirmation code)[\s:]*([0-9]{8,10})/i);
      if (otpMatch && otpMatch[1]) {
        otpCode = otpMatch[1];
      } else {
        const fallbackMatch = text.match(/\b([0-9]{8,10})\b/);
        if (fallbackMatch && fallbackMatch[1]) {
          otpCode = fallbackMatch[1];
        }
      }

      // Hành động 3: Lưu mã OTP vào Database
      if (uid && otpCode) {
        try {
          await adminDb.collection('users').doc(uid).set({
            latestGmailForwardingOtp: otpCode,
            otpUpdatedAt: new Date().toISOString()
          }, { merge: true });
          console.log(`[Tier 1] Saved OTP ${otpCode} for user ${uid}`);
        } catch (dbErr) {
          console.error(`[Tier 1] Failed to save OTP for user ${uid}:`, dbErr);
        }
      }

      // Nếu đã click link hoặc lấy được OTP, dừng phễu tại đây (Không gọi AI)
      if (linkClicked || otpCode) {
        return NextResponse.json({ 
          success: true, 
          message: 'Tier 1: Confirmation processed',
          linkClicked,
          otpExtracted: !!otpCode
        });
      }
    }

    // =====================================================================
    // KIỂM TRA USER & HẠN MỨC TRƯỚC KHI GỌI AI (GIỮ NGUYÊN 100%)
    // =====================================================================
    if (!uid) {
      return NextResponse.json({ error: 'Invalid routing address' }, { status: 400 });
    }
    
    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();

    if (!userData || (userData.transactionCount >= userData.transactionLimit)) {
      return NextResponse.json({ success: false, message: 'Transaction limit reached' }, { status: 403 });
    }

    const webhookConfigSnap = await userRef.collection('webhookConfigurations').limit(1).get();
    const referencePrefix = webhookConfigSnap.empty ? 'TT' : webhookConfigSnap.docs[0].data().referencePrefix;

    // =====================================================================
    // TẦNG 2, 3, 4: GỌI AI ĐỂ PHÂN TÍCH GIAO DỊCH
    // =====================================================================
    try {
      const extractedData = await extractTransaction({
        emailBody: text,
        referencePrefix: referencePrefix
      });

      // Nếu AI tìm thấy số tiền (Chắc chắn là email biến động số dư)
      if (extractedData && extractedData.amount > 0) {
        
        if (extractedData.referenceCode) {
          // TẦNG 2: GIAO DỊCH HỢP LỆ (Có tiền + Có Prefix) -> Bắn Webhook
          const webhookSuccess = await dispatchWebhook(uid, extractedData);
          if (webhookSuccess) {
            await userRef.update({
              transactionCount: admin.firestore.FieldValue.increment(1)
            });
          }
          return NextResponse.json({ success: true, message: 'Tier 2: Valid transaction processed' });
        
        } else {
          // TẦNG 3: GIAO DỊCH SAI CÚ PHÁP (Có tiền + KHÔNG có Prefix)
          // KHÔNG bắn Webhook, CHỈ lưu Log cảnh báo vào Database để sếp duyệt tay
          await userRef.collection('webhook_logs').add({
            ...extractedData,
            targetUrl: 'N/A',
            isSuccess: false,
            statusCode: 400,
            responseBody: `Giao dịch sai cú pháp. Khách chuyển ${extractedData.amount} nhưng quên ghi tiền tố [${referencePrefix}].`,
            createdAt: new Date().toISOString()
          });
          return NextResponse.json({ success: true, message: 'Tier 3: Syntax error logged for manual review' });
        }
      }

    } catch (aiError) {
      // TẦNG 4: THÙNG RÁC (AI báo lỗi vì không tìm thấy số tiền, ví dụ: email quảng cáo, email rác)
      console.log(`[Tier 4] Trash email ignored for user ${uid}`);
      return NextResponse.json({ success: true, message: 'Tier 4: Unprocessable email ignored' });
    }

    // Fallback an toàn
    return NextResponse.json({ success: true, message: 'Email processed' });

  } catch (error: any) {
    console.error('[Inbound Webhook Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}