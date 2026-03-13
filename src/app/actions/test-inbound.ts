'use server';

export async function triggerInboundTest(forwardEmail: string) {
  const secret = process.env.INBOUND_WEBHOOK_SECRET;
  // Lấy URL gốc của app (Local hoặc Production)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

  if (!secret) {
    return { success: false, error: 'Chưa cấu hình INBOUND_WEBHOOK_SECRET trên Server.' };
  }

  const formData = new FormData();
  formData.append('to', forwardEmail);
  formData.append('text', 'Tài khoản nhận +500,000 VND. Nội dung: TT123456 thanh toan don hang.');

  try {
    // Gọi nội bộ kèm theo secret key
    const res = await fetch(`${baseUrl}/api/webhooks/inbound?secret=${secret}`, {
      method: 'POST',
      body: formData,
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