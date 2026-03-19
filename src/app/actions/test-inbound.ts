'use server';

import * as admin from 'firebase-admin';
import { adminDb } from '@/lib/firebase-admin';
import { extractTransaction } from '@/ai/flows/extract-transaction-flow';
import { dispatchWebhook } from '@/lib/webhook-sender';

export async function triggerInboundTest(forwardEmail: string) {
  try {
    // 1. Lấy UID từ email ảo
    const uidMatch = forwardEmail.match(/inbound\+([^@]+)@/i);
    const uid = uidMatch ? uidMatch[1] : null;

    if (!uid) {
      throw new Error('Không tìm thấy UID hợp lệ trong email');
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
    return { success: false, error: error.message };
  }
}