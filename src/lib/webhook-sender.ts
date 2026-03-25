import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { ExtractTransactionOutput } from '@/ai/flows/extract-transaction-flow';

// Khai báo kiểu dữ liệu trả về để TypeScript không bị lỗi
export interface DispatchResult {
  isSuccess: boolean;
  statusCode: number;
  responseBody: string;
}

export async function dispatchWebhook(uid: string, transactionData: ExtractTransactionOutput): Promise<DispatchResult> {
  try {
    // 1. Lấy cấu hình Webhook và giới hạn lưu trữ của User
    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    const webhookLogLimit = userData?.webhookLogLimit || 100; // Mặc định 100 nếu chưa set

    const webhooksSnapshot = await userRef
      .collection('webhookConfigurations')
      .where('isEnabled', '==', true)
      .limit(1)
      .get();

      if (webhooksSnapshot.empty) {
        console.log(`[Webhook] User ${uid} has no active webhook configurations.`);
        // Trả về object đúng chuẩn DispatchResult
        return { isSuccess: false, statusCode: 404, responseBody: 'User has no active webhook configurations.' };
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
   let isSuccess = false;
   let statusCode = 0;
   let responseBody = "";

   try {
     const controller = new AbortController();
     const timeoutId = setTimeout(() => controller.abort(), 8000);

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

   // 4. Ghi Log vào Firestore và Tự động dọn dẹp
   const logsRef = userRef.collection('webhook_logs');
   await logsRef.add({
     ...transactionData,
     targetUrl,
     isSuccess,
     statusCode,
     responseBody: responseBody.substring(0, 500),
     createdAt: new Date().toISOString()
   });

   // Dọn dẹp log cũ
   const oldLogsSnap = await logsRef.orderBy('createdAt', 'desc').offset(webhookLogLimit).get();
   if (!oldLogsSnap.empty) {
     const batch = adminDb.batch();
     oldLogsSnap.docs.forEach(doc => batch.delete(doc.ref));
     await batch.commit();
   }

   // Không ném lỗi ở đây nữa mà trả về object kết quả
   // if (!isSuccess) {
   //   throw new Error(`HTTP Error: ${statusCode} - ${responseBody}`);
   // }

   console.log(`[Webhook] Dispatch attempt to ${targetUrl} for user ${uid} completed with status ${statusCode}.`);
   return { isSuccess, statusCode, responseBody };

 } catch (error: any) {
   console.error(`[Webhook] Failed to dispatch for user ${uid}:`, error);
   return { isSuccess: false, statusCode: 500, responseBody: error.message };
 }
}