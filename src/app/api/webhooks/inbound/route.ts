import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { adminDb } from '@/lib/firebase-admin';
import { extractTransaction } from '@/ai/flows/extract-transaction-flow';
import { dispatchWebhook } from '@/lib/webhook-sender';

export async function POST(req: NextRequest) {
  try {
    // SendGrid Inbound Parse gửi dữ liệu dưới dạng multipart/form-data
    const formData = await req.formData();
    
    const to = formData.get('to') as string; // VD: "inbound+USER_UID_123@omepaymail.vn"
    const text = formData.get('text') as string; // Nội dung plain text của email
    
    if (!to || !text) {
      return NextResponse.json({ error: 'Missing required fields (to, text)' }, { status: 400 });
    }

    // 1. Trích xuất UID từ địa chỉ email (Kỹ thuật Plus Addressing)
    // Match chuỗi nằm giữa "inbound+" và "@"
    const uidMatch = to.match(/inbound\+([^@]+)@/i);
    if (!uidMatch || !uidMatch[1]) {
      console.error('[Inbound Webhook] Could not extract UID from address:', to);
      return NextResponse.json({ error: 'Invalid routing address' }, { status: 400 });
    }
    
    const uid = uidMatch[1];

    // 2. Kiểm tra User và Hạn mức giao dịch trong Firestore
    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.error(`[Inbound Webhook] User ${uid} not found.`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    if (!userData || (userData.transactionCount >= userData.transactionLimit)) {
      console.log(`[Inbound Webhook] User ${uid} reached transaction limit. Skipping.`);
      return NextResponse.json({ success: false, message: 'Transaction limit reached' }, { status: 403 });
    }

    // 3. Lấy cấu hình Webhook của User để lấy Reference Prefix
    const webhookConfigSnap = await adminDb.collection('users').doc(uid).collection('webhookConfigurations').limit(1).get();
    const referencePrefix = webhookConfigSnap.empty ? 'TT' : webhookConfigSnap.docs[0].data().referencePrefix;

    // 4. Đẩy nội dung Email vào Genkit AI Flow (Tái sử dụng 100% code cũ của sếp)
    try {
      const extractedData = await extractTransaction({
        emailBody: text,
        referencePrefix: referencePrefix
      });

      // 5. Nếu AI tìm thấy mã tham chiếu hợp lệ -> Bắn Webhook về website của khách
      if (extractedData.referenceCode) {
        const webhookSuccess = await dispatchWebhook(uid, extractedData);
        
        if (webhookSuccess) {
          // Tăng biến đếm giao dịch của User lên 1
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
      // Vẫn trả về 200 để SendGrid không gửi lại (retry) email rác này
      return NextResponse.json({ success: true, message: 'Processed with AI errors' });
    }

    // Trả về 200 OK để xác nhận với SendGrid là đã nhận mail thành công
    return NextResponse.json({ success: true, message: 'Email processed successfully' });

  } catch (error: any) {
    console.error('[Inbound Webhook Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}