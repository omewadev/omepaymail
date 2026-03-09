import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { ExtractTransactionOutput } from '@/ai/flows/extract-transaction-flow';

export async function dispatchWebhook(uid: string, transactionData: ExtractTransactionOutput) {
  try {
    // 1. Lấy cấu hình Webhook của User
    const webhooksSnapshot = await adminDb
      .collection('users')
      .doc(uid)
      .collection('webhookConfigurations')
      .where('isEnabled', '==', true)
      .limit(1)
      .get();

    if (webhooksSnapshot.empty) {
      console.log(`[Webhook] User ${uid} has no active webhook configurations.`);
      return false;
    }

    const config = webhooksSnapshot.docs[0].data();
    const targetUrl = config.targetUrl;
    const secretToken = config.secretToken;

    // 2. Chuẩn bị Payload
    const payload = {
      ...transactionData,
      secretKey: secretToken,
      timestamp: new Date().toISOString()
    };

    // 3. Gửi HTTP POST Request
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PayMailHook-Engine/1.0',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    console.log(`[Webhook] Successfully dispatched to ${targetUrl} for user ${uid}`);
    return true;

  } catch (error) {
    console.error(`[Webhook] Failed to dispatch for user ${uid}:`, error);
    return false;
  }
}