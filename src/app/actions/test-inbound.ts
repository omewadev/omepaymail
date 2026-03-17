'use server';

export async function triggerInboundTest(forwardEmail: string) {
  // Dùng secret dự phòng để test
  const secret = process.env.INBOUND_WEBHOOK_SECRET || 'pmh_super_secret_2026'; 
  // Trỏ thẳng về domain thật của sếp
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://omepaymail.omewa.vn';

  // Tự động trích xuất UID từ email trên giao diện để tạo nội dung test chuẩn
  const uidMatch = forwardEmail.match(/inbound\+([^@]+)@/i);
  const uid = uidMatch ? uidMatch[1] : '9C0GPFKG';
  const emailText = `Tai khoan +199,000 VND. Noi dung: PMH PRO ${uid}`;

  try {
    // Gọi API với định dạng JSON chuẩn của Cloudflare Worker
    const res = await fetch(`${baseUrl}/api/webhooks/inbound?secret=${secret}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: forwardEmail,
        rawEmail: emailText,
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