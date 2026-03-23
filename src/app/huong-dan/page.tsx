import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Play, Download, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function IntegrationGuidePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="h-16 border-b bg-white px-8 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 text-primary font-bold hover:opacity-80">
          <ChevronLeft className="w-4 h-4" />
          Quay lại Trang chủ
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Button asChild size="sm" className="bg-accent hover:bg-accent/90 text-white">
            <Link href="/dashboard">Dùng thử miễn phí</Link>
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto py-8 md:py-12 px-4 md:px-6">
        {/* Header Section */}
        <div className="text-center space-y-4 mb-10">
          <h1 className="text-3xl sm:text-4xl font-headline font-bold text-primary">
            Hướng dẫn cài đặt tự động hóa thanh toán
            <span className="block text-accent mt-2 text-2xl md:text-3xl">(Chỉ mất 5 phút)</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Không cần biết lập trình. Chỉ cần làm theo đúng 4 bước dưới đây, website của bạn sẽ tự động chốt đơn khi có tiền về.
          </p>
        </div>

        {/* Video Placeholder 16:9 */}
        <div className="relative w-full aspect-video bg-slate-800 rounded-xl shadow-lg mb-12 overflow-hidden group cursor-pointer flex items-center justify-center border-4 border-white">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
          <p className="absolute bottom-4 left-4 text-white/80 text-sm font-medium">Video hướng dẫn chi tiết (3 phút)</p>
        </div>

        {/* Accordion Steps */}
        <div className="bg-white rounded-2xl shadow-sm border p-2 md:p-6">
          <Accordion type="single" collapsible defaultValue="step-1" className="w-full">
            
            {/* Item 0 */}
            <AccordionItem value="step-0" className="border-b-slate-100">
              <AccordionTrigger className="text-left font-bold text-slate-700 hover:text-primary">
                TRƯỚC KHI BẮT ĐẦU: BẠN CẦN CHUẨN BỊ GÌ?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 space-y-2 leading-relaxed pt-2 pb-4">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Một website bán hàng sử dụng WordPress (WooCommerce).</li>
                  <li>Một tài khoản ngân hàng có đăng ký dịch vụ nhận thông báo biến động số dư qua Email.</li>
                  <li>Một tài khoản Gmail để nhận thư từ ngân hàng.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Item 1 (Mở mặc định) */}
            <AccordionItem value="step-1" className="border-b-slate-100">
              <AccordionTrigger className="text-left font-bold text-primary hover:text-accent">
                BƯỚC 1: TẠO MÃ NHẬN DIỆN TRÊN PAYMAILHOOK
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 space-y-3 leading-relaxed pt-2 pb-4">
                <ul className="list-decimal pl-5 space-y-2">
                  <li>Đăng nhập vào PayMailHook, truy cập menu <strong>Cài đặt</strong>.</li>
                  <li>Tại ô Tiền tố mã đơn hàng (Prefix), hãy nhập một chữ cái ngắn gọn. Ví dụ: <strong>DH</strong> (Đơn Hàng).</li>
                  <li>Từ nay, khi khách mua hàng, bạn chỉ cần yêu cầu họ chuyển khoản với nội dung: <strong>DH12345</strong> (trong đó 12345 là mã số đơn). Trí tuệ nhân tạo của chúng tôi sẽ tự động tìm đúng chữ DH này để xác nhận.</li>
                  <li>Copy đoạn <strong>Secret Key</strong> hiển thị trên màn hình để dùng cho Bước 2.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Item 2 */}
            <AccordionItem value="step-2" className="border-b-slate-100">
              <AccordionTrigger className="text-left font-bold text-primary hover:text-accent">
                BƯỚC 2: CÀI ĐẶT PLUGIN LÊN WEBSITE WORDPRESS
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 space-y-4 leading-relaxed pt-2 pb-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
                  <p className="mb-3 font-medium text-slate-800">Tải file Plugin cài đặt tự động tại đây:</p>
                  <Button asChild className="bg-accent hover:bg-accent/90 text-white shadow-md">
                    <a href="/paymailhook-wc.zip" download>
                      <Download className="w-4 h-4 mr-2" /> Tải xuống paymailhook-wc.zip
                    </a>
                  </Button>
                </div>
                <ul className="list-decimal pl-5 space-y-2">
                  <li>Vào trang Quản trị WordPress của bạn {'>'} Chọn <strong>Plugin</strong> {'>'} <strong>Cài mới</strong> {'>'} <strong>Tải plugin lên</strong> {'>'} Chọn file .zip vừa tải và bấm Kích hoạt.</li>
                  <li>Nhìn sang menu bên trái của WordPress, chọn <strong>Cài đặt</strong> {'>'} <strong>PayMailHook</strong>.</li>
                  <li>Dán <strong>Secret Key</strong> và <strong>Tiền tố (Prefix)</strong> bạn đã tạo ở Bước 1 vào. Bấm Lưu.</li>
                  <li>Copy đường link Webhook màu đỏ xuất hiện trên màn hình, quay lại PayMailHook và dán vào ô <strong>URL Webhook</strong>.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Item 3 */}
            <AccordionItem value="step-3" className="border-b-slate-100">
              <AccordionTrigger className="text-left font-bold text-primary hover:text-accent">
                BƯỚC 3: CÀI ĐẶT GMAIL TỰ ĐỘNG CHUYỂN TIẾP (QUAN TRỌNG NHẤT)
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 space-y-4 leading-relaxed pt-2 pb-4">
                <ul className="list-decimal pl-5 space-y-2">
                  <li>Copy địa chỉ email ảo của bạn trên PayMailHook (Ví dụ: <code>inbound+abc@omepaymail.vn</code>).</li>
                  <li>Vào Cài đặt Gmail của bạn {'>'} Tab <strong>Chuyển tiếp và POP/IMAP</strong> {'>'} Thêm địa chỉ chuyển tiếp vừa copy. Gmail sẽ gửi 1 mã xác nhận, hệ thống của chúng tôi sẽ tự động duyệt mã này cho bạn trong 1 phút.</li>
                  <li>Tạo bộ lọc (Filter): Vào ô tìm kiếm của Gmail, nhập email của ngân hàng vào ô <strong>"Từ"</strong> (VD: <code>no-reply@mbbank.com.vn</code>). Bấm <strong>"Tạo bộ lọc"</strong>.</li>
                  <li>Tích chọn <strong>"Chuyển tiếp đến:"</strong> và chọn địa chỉ email ảo của bạn. Bấm <strong>"Tạo bộ lọc"</strong> để hoàn tất.</li>
                </ul>

                <Alert className="bg-amber-50 border-amber-200 mt-4">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <AlertTitle className="text-amber-800 font-bold">Cảnh báo chống Spam (Tiết kiệm Hạn mức)</AlertTitle>
                  <AlertDescription className="text-amber-700 mt-1 text-sm">
                    <strong>TUYỆT ĐỐI KHÔNG</strong> chọn "Chuyển tiếp tất cả email". Bạn <strong>BẮT BUỘC</strong> phải tạo Bộ lọc (Filter) để chỉ chuyển tiếp thư từ Ngân hàng. Việc chuyển tiếp thư rác/quảng cáo sẽ làm cạn kiệt "Hạn mức giao dịch" của bạn rất nhanh do AI vẫn phải đọc và xử lý.
                  </AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>

            {/* Item 4 */}
            <AccordionItem value="step-4" className="border-none">
              <AccordionTrigger className="text-left font-bold text-primary hover:text-accent">
                BƯỚC 4: TỰ MUA HÀNG VÀ KIỂM TRA (TESTING)
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 space-y-3 leading-relaxed pt-2 pb-2">
                <ul className="list-decimal pl-5 space-y-2">
                  <li>Lên website của bạn, đặt 1 đơn hàng ảo (Ví dụ mã đơn là <strong>105</strong>).</li>
                  <li>Dùng app ngân hàng chuyển khoản 10.000đ với nội dung: <strong>DH105</strong>.</li>
                  <li className="flex items-start gap-2 text-green-700 font-medium mt-4">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    Ngồi nhâm nhi cafe và xem đơn hàng tự động chuyển sang "Đã thanh toán" trong 5 giây!
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t text-center text-muted-foreground text-sm bg-white">
        <p>© 2026 PayMailHook Integration Guide. Security First.</p>
      </footer>
    </div>
  );
}