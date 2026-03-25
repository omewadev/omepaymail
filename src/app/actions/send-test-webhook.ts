'use server';

import { adminDb } from '@/lib/firebase-admin';
import { dispatchWebhook } from '@/lib/webhook-sender';
import { ExtractTransactionOutput } from '@/ai/flows/extract-transaction-flow';

export async function sendTestWebhook(uid: string, webhookId: string) {
  if (!uid || !webhookId) {
    return { success: false, error: 'Thiếu thông tin User hoặc Webhook ID.' };
  }

  try {
    // 1. Lấy cấu hình của webhook cụ thể cần test
    const webhookDoc = await adminDb
      .collection('users')
      .doc(uid)
      .collection('webhookConfigurations')
      .doc(webhookId)
      .get();

    if (!webhookDoc.exists) {
      return { success: false, error: 'Không tìm thấy cấu hình Webhook.' };
    }
    const config = webhookDoc.data();
    if (!config?.isEnabled) {
        return { success: false, error: 'Webhook đang bị tắt (disabled).' };
    }

    // 2. Tạo một payload giả lập (mock)
    const mockPayload: ExtractTransactionOutput = {
      amount: 10000,
      currency: 'VND',
      transactionType: 'credit',
      referenceCode: `${config.referencePrefix || 'TEST'}007`,
      senderName: 'PAYMAILHOOK TEST',
      timestamp: new Date().toISOString(),
    };

    // 3. Gọi hàm dispatchWebhook hiện có để gửi đi
    const success = await dispatchWebhook(uid, mockPayload);

    if (success) {
      return { success: true };
    } else {
      return { success: false, error: 'Gửi thất bại. URL Webhook có thể bị lỗi hoặc không phản hồi.' };
    }

  } catch (error: any) {
    console.error('[Send Test Webhook Error]', error);
    return { success: false, error: error.message || 'Lỗi không xác định từ server.' };
  }
}