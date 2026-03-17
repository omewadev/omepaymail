'use server';

export async function triggerInboundTest(forwardEmail: string) {
  const secret = process.env.INBOUND_WEBHOOK_SECRET || 'pmh_super_secret_2026'; 
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://omepaymail.omewa.vn';

  const uidMatch = forwardEmail.match(/inbound\+([^@]+)@/i);
  const uid = uidMatch ? uidMatch[1] : '9C0GPFKG';
  const emailText = `Tai khoan +199,000 VND. Noi dung: PMH PRO ${uid}`;

  try {
    const res = await fetch(`${baseUrl}/api/webhooks/inbound?secret=${secret}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: forwardEmail,
        rawEmail: emailText, // Gửi rawEmail để đồng bộ với Cloudflare
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Lỗi khi gọi Webhook');
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

### 2. CẬP NHẬT FILE API (BACKEND)
**Tên file:** `src/app/api/webhooks/inbound/route.ts`
*(Sếp bôi đen toàn bộ và dán đè code này vào)*
```typescript
import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { adminDb } from '@/lib/firebase-admin';
import { extractTransaction } from '@/ai/flows/extract-transaction-flow';
import { dispatchWebhook } from '@/lib/webhook-sender';
import PostalMime from 'postal-mime';

export async function POST(req: NextRequest) {
  try {
    const secret = req.nextUrl.searchParams.get('secret');
    const expectedSecret = process.env.INBOUND_WEBHOOK_SECRET || 'pmh_super_secret_2026';

    if (!expectedSecret) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const to = body.to as string; 
    // Chấp nhận cả rawEmail (từ Cloudflare/Test) hoặc text (từ code cũ)
    const rawEmail = body.rawEmail || body.text; 
    
    if (!to || !rawEmail) {
      return NextResponse.json({ error: 'Missing required fields (to, rawEmail)' }, { status: 400 });
    }

    let text = "";
    try {
      // Thử parse bằng postal-mime (Dành cho email thật từ Cloudflare)
      const parser = new PostalMime();
      const parsedEmail = await parser.parse(rawEmail);
      text = parsedEmail.text || parsedEmail.html || rawEmail;
    } catch (e) {
      // Nếu lỗi parse (do là text test từ giao diện), lấy luôn text gốc
      text = rawEmail;
    }

    const uidMatch = to.match(/inbound\+([^@]+)@/i);
    if (!uidMatch || !uidMatch[1]) {
      return NextResponse.json({ error: 'Invalid routing address' }, { status: 400 });
    }
    
    const uid = uidMatch[1];

    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
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
    }
    // =====================================================================

    if (!userData || (userData.transactionCount >= userData.transactionLimit)) {
      return NextResponse.json({ success: false, message: 'Transaction limit reached' }, { status: 403 });
    }

    const webhookConfigSnap = await adminDb.collection('users').doc(uid).collection('webhookConfigurations').limit(1).get();
    const referencePrefix = webhookConfigSnap.empty ? 'TT' : webhookConfigSnap.docs[0].data().referencePrefix;

    try {
      const extractedData = await extractTransaction({
        emailBody: text,
        referencePrefix: referencePrefix
      });

      if (extractedData.referenceCode) {
        const webhookSuccess = await dispatchWebhook(uid, extractedData);
        if (webhookSuccess) {
          await userRef.update({
            transactionCount: admin.firestore.FieldValue.increment(1)
          });
        }
      }
    } catch (aiError) {
      return NextResponse.json({ success: true, message: 'Processed with AI errors' });
    }

    return NextResponse.json({ success: true, message: 'Email processed successfully' });

  } catch (error: any) {
    console.error('[Inbound Webhook Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}