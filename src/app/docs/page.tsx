
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, FileCode, Globe } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function PublicDocsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="h-16 border-b bg-white px-8 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 text-primary font-bold hover:opacity-80">
          <ChevronLeft className="w-4 h-4" />
          Quay lại Trang chủ
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Button asChild size="sm" className="bg-accent">
            <Link href="/dashboard">Dùng thử miễn phí</Link>
          </Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-12 px-6">
        <div className="space-y-4 mb-12">
          <h1 className="text-4xl font-headline font-bold text-primary">Tài liệu Tích hợp Hệ thống</h1>
          <p className="text-lg text-muted-foreground">PayMailHook cung cấp cơ chế Webhook đơn giản để kết nối Gmail với website của bạn.</p>
        </div>

        <div className="grid gap-8">
          <Card className="border-none shadow-md overflow-hidden">
            <div className="h-1 bg-primary" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-accent" />
                Tổng quan quy trình
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg border text-center space-y-2">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mx-auto font-bold">1</div>
                  <p className="text-sm font-bold">Lắng nghe Gmail</p>
                  <p className="text-xs text-muted-foreground">Hệ thống AI nhận thông báo bank từ Gmail.</p>
                </div>
                <div className="p-4 bg-white rounded-lg border text-center space-y-2">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mx-auto font-bold">2</div>
                  <p className="text-sm font-bold">Trích xuất Dữ liệu</p>
                  <p className="text-xs text-muted-foreground">AI bóc tách Số tiền &amp; Mã tham chiếu đơn hàng.</p>
                </div>
                <div className="p-4 bg-white rounded-lg border text-center space-y-2">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mx-auto font-bold">3</div>
                  <p className="text-sm font-bold">Gửi Webhook</p>
                  <p className="text-xs text-muted-foreground">Dữ liệu được bắn về URL website của bạn.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
              <FileCode className="w-6 h-6 text-accent" />
              Hướng dẫn chi tiết theo nền tảng
            </h2>
            
            <Tabs defaultValue="wordpress" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="wordpress" className="font-bold">WordPress (WooCommerce)</TabsTrigger>
                <TabsTrigger value="custom" className="font-bold">Custom Website (API)</TabsTrigger>
              </TabsList>

              <TabsContent value="wordpress" className="mt-6 space-y-6">
                <Card className="border-none shadow-sm">
                  <CardContent className="pt-6 space-y-4">
                    <p className="text-sm leading-relaxed">
                      Dán đoạn mã dưới đây vào file <code>functions.php</code> của theme hoặc dùng plugin &quot;Code Snippets&quot;. 
                      Đoạn mã này sẽ tạo một Endpoint nhận dữ liệu từ PayMailHook và tự động đổi trạng thái đơn hàng sang &quot;Đã hoàn thành&quot;.
                    </p>
                    <div className="bg-slate-900 text-green-400 p-6 rounded-xl font-mono text-xs overflow-x-auto">
                      <pre>
{`<?php
add_action('rest_api_init', function () {
    register_rest_route('paymail/v1', '/confirm', [
        'methods' => 'POST',
        'callback' => 'handle_paymail_webhook',
        'permission_callback' => '__return_true',
    ]);
});

function handle_paymail_webhook($request) {
    $params = $request->get_json_params();
    $amount = $params['amount'] ?? 0;
    $refCode = $params['referenceCode'] ?? '';
    
    // Tách ID đơn hàng (VD: TT105 -> 105)
    $order_id = str_replace('TT', '', $refCode);
    $order = wc_get_order($order_id);
    
    if ($order) {
        $order->update_status('completed', 'Auto-confirmed by PayMailHook');
        return new WP_REST_Response(['success' => true], 200);
    }
    return new WP_REST_Response(['success' => false], 404);
}`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="custom" className="mt-6 space-y-6">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Cấu trúc dữ liệu JSON (Payload)</CardTitle>
                    <CardDescription>Mọi website đều nhận được gói tin JSON chuẩn qua POST request.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-slate-900 text-blue-300 p-6 rounded-xl font-mono text-sm">
{`{
  "amount": 500000,
  "referenceCode": "TT123456",
  "senderName": "NGUYEN VAN A",
  "currency": "VND",
  "secretKey": "pmh_live_xxxxxxxx",
  "timestamp": "2024-03-20T15:30:00Z"
}`}
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold">Các bước tích hợp:</h4>
                      <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                        <li>Tạo một API Endpoint nhận POST request.</li>
                        <li>Kiểm tra <code>secretKey</code> để đảm bảo dữ liệu gửi từ PayMailHook.</li>
                        <li>Dùng <code>referenceCode</code> để tìm đơn hàng trong database của bạn.</li>
                        <li>Cập nhật số dư hoặc trạng thái thanh toán.</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>

          <div className="bg-accent/5 p-8 rounded-2xl border border-accent/10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6"> {/* Thêm flex-col md:flex-row và điều chỉnh gap */}
            <div className="space-y-1 text-center md:text-left"> {/* Thêm text-center md:text-left */}
              <h3 className="text-xl font-bold text-primary">Sẵn sàng để tự động hóa?</h3>
              <p className="text-sm text-muted-foreground">Đăng ký ngay để bắt đầu nhận thông báo thanh toán tức thì.</p>
            </div>
            <Button asChild size="lg" className="bg-accent shadow-lg shadow-accent/20">
              <Link href="/dashboard">Bắt đầu miễn phí ngay <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t text-center text-muted-foreground text-sm">
        <p>© 2024 PayMailHook Integration Guide. Security First.</p>
      </footer>
    </div>
  );
}

function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
