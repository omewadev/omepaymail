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