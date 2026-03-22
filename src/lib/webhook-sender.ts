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

   // 3. Gửi HTTP POST Request & Ghi Log
   let isSuccess = false;
   let statusCode = 0;
   let responseBody = "";

   try {
     const controller = new AbortController();
     const timeoutId = setTimeout(() => controller.abort(), 8000); // Ép Timeout sau 8 giây

     const response = await fetch(targetUrl, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'User-Agent': 'PayMailHook-Engine/1.0',
       },
       body: JSON.stringify(payload),
       signal: controller.signal
     });
     
     clearTimeout(timeoutId);
     statusCode = response.status;
     isSuccess = response.ok;
     responseBody = await response.text();
   } catch (fetchError: any) {
     isSuccess = false;
     if (fetchError.name === 'AbortError') {
       statusCode = 408;
       responseBody = "Request Timeout: URL Webhook phản hồi quá chậm (>8s).";
     } else {
       statusCode = 500;
       responseBody = fetchError.message || "Connection failed";
     }
   }

   // 4. Ghi Log vào Firestore
   await adminDb.collection('users').doc(uid).collection('webhook_logs').add({
     ...transactionData,
     targetUrl,
     isSuccess,
     statusCode,
     responseBody: responseBody.substring(0, 500), // Giới hạn độ dài log để tiết kiệm DB
     createdAt: new Date().toISOString()
   });

   if (!isSuccess) {
     throw new Error(`HTTP Error: ${statusCode} - ${responseBody}`);
   }

   console.log(`[Webhook] Successfully dispatched to ${targetUrl} for user ${uid}`);
   return true;

 } catch (error) {
   console.error(`[Webhook] Failed to dispatch for user ${uid}:`, error);
   return false;
 }
}