import 'server-only';
import * as admin from 'firebase-admin';

// Khởi tạo an toàn cho môi trường Next.js (tránh lỗi khởi tạo nhiều lần)
if (!admin.apps.length) {
  admin.initializeApp({
    // Trong môi trường Firebase App Hosting / GCP, thông tin xác thực tự động được nhận diện.
    // Nếu chạy local, sếp cần set biến môi trường GOOGLE_APPLICATION_CREDENTIALS
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'omepaymail',
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();