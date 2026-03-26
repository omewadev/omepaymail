'use server';

import * as admin from 'firebase-admin';
import { adminDb } from '@/lib/firebase-admin';
import { extractTransaction } from '@/ai/flows/extract-transaction-flow';
import { dispatchWebhook } from '@/lib/webhook-sender';

export async function triggerInboundTest(forwardEmail: string) {
  try {
    // 1. Lấy UID từ email ảo
    const uidMatch = forwardEmail.match(/inbound\+([^@]+)@/i);
    let uid = uidMatch ? uidMatch[1] : null;

    if (!uid) {
      throw new Error('Không tìm thấy UID hợp lệ trong email');
    }

    // [FIX CRITICAL] Tìm UID gốc (có phân biệt hoa thường) từ uidLower
    const lowerUid = uid.toLowerCase();
    const userSnap = await adminDb.collection('users').doc(uid).get();
    if (!userSnap.exists) {
      const querySnap = await adminDb.collection('users').where('uidLower', '==', lowerUid).limit(1).get();
      if (querySnap.empty) throw new Error('Không tìm thấy User trong hệ thống');
      uid = querySnap.docs[0].id; // Gán lại uid chuẩn để các hàm bên dưới không bị lỗi 404
    }

    // 2. Lấy cấu hình Prefix của User từ Database
    const webhookConfigSnap = await adminDb.collection('users').doc(uid).collection('webhookConfigurations').limit(1).get();
    const referencePrefix = webhookConfigSnap.empty ? 'TT' : webhookConfigSnap.docs[0].data().referencePrefix;

    // 3. Tạo nội dung email giả lập chứa đúng Prefix của User
    const emailText = `Tai khoan +500,000 VND. Noi dung: ${referencePrefix}123456 thanh toan don hang`;

    // 4. Gọi thẳng AI để trích xuất (Không dùng fetch HTTP gây lỗi trên IDX)
    const extractedData = await extractTransaction({
      emailBody: emailText,
      referencePrefix: referencePrefix
    });

    // 5. Bắn Webhook và ghi Log
    if (extractedData.referenceCode) {
      const webhookSuccess = await dispatchWebhook(uid, extractedData);
      if (webhookSuccess) {
        await adminDb.collection('users').doc(uid).update({
          transactionCount: admin.firestore.FieldValue.increment(1)
        });
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('[Test Inbound Error]', error);
    
    // [FIX] Bắt lỗi 429 Quota Exceeded của Google Gemini để hiển thị tiếng Việt thân thiện
    if (error.message && (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED'))) {
      return { 
        success: false, 
        error: "Hệ thống AI đang quá tải hoặc hết hạn mức API miễn phí. Vui lòng thử lại sau ít phút hoặc kiểm tra lại Billing của Google AI Studio." 
      };
    }

    return { success: false, error: error.message || "Có lỗi xảy ra khi kết nối AI." };
  }
}