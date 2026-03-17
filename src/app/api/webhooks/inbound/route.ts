import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { adminDb } from '@/lib/firebase-admin';
import { extractTransaction } from '@/ai/flows/extract-transaction-flow';
import { dispatchWebhook } from '@/lib/webhook-sender';

export async function POST(req: NextRequest) {
  try {
    // 0. Kiểm tra bảo mật (Security Check)
    const secret = req.nextUrl.searchParams.get('secret');
    // Fallback secret cho môi trường test local
    const expectedSecret = process.env.INBOUND_WEBHOOK_SECRET || 'pmh_super_secret_2026';

    if (!expectedSecret) {
      console.error('[Inbound Webhook] INBOUND_WEBHOOK_SECRET is not set in environment variables.');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (secret !== expectedSecret) {
      console.warn('[Inbound Webhook] Unauthorized access attempt. Invalid secret.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Đã đổi sang nhận JSON từ Cloudflare Worker thay vì FormData của SendGrid
    const body = await req.json();
    const to = body.to as string; // VD: "inbound+USER_UID_123@omepaymail.vn"
    const text = body.text as string; // Nội dung plain text của email
    
    if (!to || !text) {
      return NextResponse.json({ error: 'Missing required fields (to, text)' }, { status: 400 });
    }

    // 1. Trích xuất UID từ địa chỉ email (Kỹ thuật Plus Addressing)
    const uidMatch = to.match(/inbound\+([^@]+)@/i);
    if (!uidMatch || !uidMatch[1]) {
      console.error('[Inbound Webhook] Could not extract UID from address:', to);
      return NextResponse.json({ error: 'Invalid routing address' }, { status: 400 });
    }
    
    const uid = uidMatch[1];

    // 2. Kiểm tra User trong Firestore
    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.error(`[Inbound Webhook] User ${uid} not found.`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();

    // =====================================================================
    // LOGIC XỬ LÝ THANH TOÁN NỘI BỘ (DOGFOODING) DÀNH CHO ADMIN
    // =====================================================================
    if (userData?.role === 'admin') {
      const upgradeMatch = text.match(/PMH\s+(PRO|ENTERPRISE)\s+([A-Z0-9]{8})/i);
      
      if (upgradeMatch) {
        const planName = upgradeMatch[1].toUpperCase();
        const shortUid = upgradeMatch[2].toUpperCase();
        
        console.log(`[Admin Webhook] Detected upgrade request: Plan=${planName}, TargetShortUID=${shortUid}`);

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

          console.log(`[Admin Webhook] Successfully upgraded user ${targetUserDoc.id} to ${planName}`);
          return NextResponse.json({ success: true, message: `Upgraded user to ${planName}` });
        } else {
          console.warn(`[Admin Webhook] Could not find user with short UID: ${shortUid}`);
          return NextResponse.json({ success: true, message: 'Upgrade failed: User not found' });
        }
      }
    }
    // =====================================================================

    // 3. Kiểm tra Hạn mức giao dịch (Dành cho User bình thường)
    if (!userData || (userData.transactionCount >= userData.transactionLimit)) {
      console.log(`[Inbound Webhook] User ${uid} reached transaction limit. Skipping.`);
      return NextResponse.json({ success: false, message: 'Transaction limit reached' }, { status: 403 });
    }

    // 4. Lấy cấu hình Webhook của User để lấy Reference Prefix
    const webhookConfigSnap = await adminDb.collection('users').doc(uid).collection('webhookConfigurations').limit(1).get();
    const referencePrefix = webhookConfigSnap.empty ? 'TT' : webhookConfigSnap.docs[0].data().referencePrefix;

    // 5. Đẩy nội dung Email vào Genkit AI Flow
    try {
      const extractedData = await extractTransaction({
        emailBody: text,
        referencePrefix: referencePrefix
      });

      // 6. Nếu AI tìm thấy mã tham chiếu hợp lệ -> Bắn Webhook về website của khách
      if (extractedData.referenceCode) {
        const webhookSuccess = await dispatchWebhook(uid, extractedData);
        
        if (webhookSuccess) {
          await userRef.update({
            transactionCount: admin.firestore.FieldValue.increment(1)
          });
          console.log(`[Inbound Webhook] Successfully processed and dispatched for user ${uid}`);
        }
      } else {
        console.log(`[Inbound Webhook] AI found no matching reference code for user ${uid}`);
      }
    } catch (aiError) {
      console.error(`[AI Error] Failed to process email for user ${uid}:`, aiError);
      return NextResponse.json({ success: true, message: 'Processed with AI errors' });
    }

    return NextResponse.json({ success: true, message: 'Email processed successfully' });

  } catch (error: any) {
    console.error('[Inbound Webhook Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}