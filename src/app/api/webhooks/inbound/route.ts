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
    // [FIX 1] Xử lý an toàn payload từ nhiều dịch vụ Email Routing khác nhau
    const toField = body.to || body.recipient || ''; 
    const to = Array.isArray(toField) ? toField.join(',') : String(toField);
    const rawEmail = body.rawEmail || body.email || body.text || ''; 
    
    if (!rawEmail) {
      return NextResponse.json({ error: 'Missing required field (rawEmail)' }, { status: 400 });
    }

    let text = "";
    let parsedTo = "";
    let parsedEmail: any = null; // Đưa biến ra ngoài để dùng cho Hộp thư ảo
    try {
      const parser = new PostalMime();
      parsedEmail = await parser.parse(rawEmail);
      text = parsedEmail.text || parsedEmail.html || rawEmail;
      parsedTo = parsedEmail.to?.map((t: any) => t.address).join(',') || '';
    } catch (e) {
      text = rawEmail;
    }

    // [FIX 2] Lấy UID chính xác từ header gốc của email
    const searchTo = parsedTo || to || text; 
    const uidMatch = searchTo.match(/inbound\+([^@>"\s]+)@/i);
    const uid = uidMatch ? uidMatch[1].trim() : null;

    // =====================================================================
    // LƯU BẢN SAO EMAIL VÀO HỘP THƯ ẢO (VIRTUAL INBOX)
    // =====================================================================
    if (uid) {
      // Chạy bất đồng bộ (Non-blocking) để không làm chậm tốc độ Webhook
      (async () => {
        try {
          const emailData = {
            subject: parsedEmail?.subject || '(Không có tiêu đề)',
            from: parsedEmail?.from?.address || 'unknown',
            fromName: parsedEmail?.from?.name || '',
            snippet: (parsedEmail?.text || text || '').substring(0, 120).replace(/\n/g, ' ') + '...',
            bodyHtml: parsedEmail?.html || parsedEmail?.text || text || '',
            receivedAt: new Date().toISOString(),
            isRead: false,
          };
          
          const emailsRef = adminDb.collection('users').doc(uid).collection('emails');
          await emailsRef.add(emailData);

          // Tự động dọn dẹp: Chỉ giữ lại 1000 email mới nhất theo yêu cầu
          const oldEmailsSnap = await emailsRef.orderBy('receivedAt', 'desc').offset(1000).get();
          if (!oldEmailsSnap.empty) {
            const batch = adminDb.batch();
            oldEmailsSnap.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
          }
        } catch (err) {
          console.error(`[Virtual Inbox] Failed to save email for user ${uid}:`, err);
        }
      })();
    }

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
    // TẦNG 1: LỌC EMAIL XÁC NHẬN (UNIVERSAL CONFIRMATION CATCHER - HYBRID)
    // =====================================================================
    const isConfirmationIntent = text.match(/(forwarding-noreply|đã yêu cầu tự động chuyển tiếp|has requested to automatically forward|xác nhận|confirmation|verify)/i);
    
    if (isConfirmationIntent) {
      let linkClicked = false;
      let otpCode = null;
      let targetLink = null;

      // Làm sạch text: Xóa các dấu xuống dòng bị ngắt quãng giữa chừng làm đứt link
      const cleanText = text.replace(/=\r?\n/g, '').replace(/\s+/g, ' ');

      // [HYBRID BƯỚC 1] FAST-TRACK: Thử dùng Regex bắt nhanh cho Gmail (Tốc độ 10ms)
      const gmailOtpMatch = cleanText.match(/(?:Mã xác nhận|Confirmation code|Mã xác minh)[\s:-]*([0-9]{8,10})/i);
      // Cập nhật Regex: Bắt mọi subdomain của google.com/mail/vf- và tự động thêm https:// nếu thiếu
      const gmailLinkMatch = cleanText.match(/(?:https:\/\/)?(?:[a-zA-Z0-9.-]*google\.com\/mail\/vf-[a-zA-Z0-9%_-]+)/i);
      
      if (gmailOtpMatch) otpCode = gmailOtpMatch[1];
      if (gmailLinkMatch) {
        targetLink = gmailLinkMatch[0];
        if (!targetLink.startsWith('http')) {
          targetLink = 'https://' + targetLink;
        }
      }

      //[HYBRID BƯỚC 2] SMART-TRACK: Nếu không phải Gmail (Zoho, Custom Mail...), GỌI AI ĐỂ ĐỌC HIỂU
      if (!otpCode && !targetLink) {
        try {
          console.log(`[Tier 1] Non-Gmail provider detected. Calling AI for analysis...`);
          const { output } = await ai.generate({
            prompt: `Bạn là chuyên gia phân tích email. Đọc email xác minh chuyển tiếp (forwarding) dưới đây.
            Nhiệm vụ:
            1. Tìm mã OTP (thường là chuỗi số).
            2. Tìm đường link HTTPS dùng để XÁC NHẬN (CONFIRM/APPROVE/VERIFY). 
            TUYỆT ĐỐI BỎ QUA các link dùng để HỦY (CANCEL/DENY), link hỗ trợ (support), hoặc link ảnh.
            Trả về JSON. Nếu không thấy, trả về null.
            
            Nội dung Email:\n${text}`,
            output: { 
              schema: z.object({ 
                otp: z.string().nullable(), 
                confirmUrl: z.string().nullable() 
              }) 
            }
          });
          
          otpCode = output?.otp || null;
          targetLink = output?.confirmUrl || null;
        } catch (aiErr) {
          console.error('[Tier 1] AI failed to extract confirmation data:', aiErr);
        }
      }

      //[HÀNH ĐỘNG] Click Link Xác nhận (Nếu có)
      if (targetLink) {
        try {
          const confirmUrl = targetLink.replace(/&amp;/g, '&').replace(/&quot;/g, '');
          const response = await fetch(confirmUrl, { 
            method: 'GET', 
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            signal: AbortSignal.timeout(8000) 
          });
          if (response.ok) {
            linkClicked = true;
            console.log(`[Tier 1] Auto-clicked verified link: ${confirmUrl}`);
          }
        } catch (err) {
          console.error('[Tier 1] Auto-click link failed:', err);
        }
      }

      //[HÀNH ĐỘNG] Lưu OTP vào Database (Nếu có)
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

      // Dừng phễu tại đây, trả về kết quả cho Webhook Sender
      return NextResponse.json({ 
        success: true, 
        message: 'Tier 1: Confirmation processed',
        linkClicked,
        otpExtracted: !!otpCode,
        provider: (gmailOtpMatch || gmailLinkMatch) ? 'Gmail' : 'Other/AI'
      });
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