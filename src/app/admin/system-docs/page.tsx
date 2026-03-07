
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Cpu, ShieldCheck, Database, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const README_CONTENT = `# PayMailHook - Hệ thống Xác thực Thanh toán Tự động qua Gmail & AI

## 1. Giới thiệu tổng quan
PayMailHook là giải pháp SaaS giúp các chủ website (WordPress, Custom Web) tự động hóa việc xác nhận đơn hàng thông qua thông báo biến động số dư từ Email ngân hàng. Hệ thống sử dụng trí tuệ nhân tạo (Gemini AI) để trích xuất dữ liệu thay vì các bộ lọc Regex cứng nhắc.

## 2. Kiến trúc Kỹ thuật (Tech Stack)
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS.
- **UI Components**: ShadCN UI (Radix UI).
- **Backend/Database**: Firebase (Firestore, Authentication, Hosting).
- **AI Engine**: Google Genkit + Gemini 2.5 Flash.
- **Language Support**: Đa ngôn ngữ (VI/EN).

## 3. Luồng Logic Hoạt động (Core Logic Flow)
1. **Trigger**: Ngân hàng gửi email thông báo giao dịch thành công đến Gmail của User.
2. **Detection**: Gmail API (Google OAuth 2.0) phát hiện thư mới và đẩy dữ liệu về hệ thống.
3. **Processing (AI Extract)**: 
   - Hệ thống lấy nội dung email và "Tiền tố mã đơn hàng" (Reference Prefix - ví dụ: CG, TT) từ cấu hình của User.
   - Genkit AI thực hiện phân tích ngữ nghĩa để tìm số tiền, mã tham chiếu, tên người gửi và thời gian.
4. **Validation**: Kiểm tra tính hợp lệ của mã tham chiếu dựa trên cấu hình User đã cài đặt.
5. **Webhook Delivery**: 
   - Hệ thống đóng gói dữ liệu JSON.
   - Gửi yêu cầu POST đến URL Webhook của Merchant (Website của khách hàng).
   - Tích hợp mã Secret Token để đảm bảo tính bảo mật của Webhook.
6. **Confirmation**: Website khách hàng nhận Webhook, đối soát và tự động chuyển trạng thái đơn hàng sang "Đã thanh toán".

## 4. Cấu trúc Dữ liệu (Firestore Schema)
- **/users/{userId}**: Thông tin profile, gói cước (planName), hạn mức giao dịch (transactionLimit/Count).
- **/users/{userId}/webhookConfigurations**: Cấu hình URL đích, mã bí mật, tiền tố mã đơn hàng.
- **/users/{userId}/gmailListenerConfigurations**: Trạng thái kết nối Google OAuth.

## 5. Hệ thống Quản trị (Admin Panel)
- **Quản lý User**: Theo dõi danh sách khách hàng và điều chỉnh hạn mức thủ công.
- **Cảnh báo (Alerts)**: AI tự động soạn thảo email nhắc nợ khi khách hàng dùng vượt ngưỡng 85% hạn mức.
- **Báo cáo**: Thống kê số lượng giao dịch theo thời gian thực.

## 6. Tính năng Linh hoạt (Dynamic Flexibility)
- Không cố định mã tham chiếu: User có thể tự định nghĩa prefix (ví dụ web A dùng 'CG', web B dùng 'DH').
- Đa nền tảng: Hỗ trợ WordPress qua Plugin mẫu và Custom Web qua tài liệu JSON chuẩn.
`;

export default function SystemDocsPage() {
  const { toast } = useToast();

  const handleDownloadReadme = () => {
    try {
      const blob = new Blob([README_CONTENT], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "PAYMAILHOOK_README.md";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Tải về thành công",
        description: "Tệp README.md đã được lưu vào máy tính của bạn.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải tệp lúc này.",
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <FileText className="w-8 h-8 text-accent" />
            Tài liệu Kỹ thuật Hệ thống
          </h2>
          <p className="text-muted-foreground">Mô tả chi tiết kiến trúc, logic và hướng dẫn vận hành SaaS.</p>
        </div>
        <Button onClick={handleDownloadReadme} className="bg-accent hover:bg-accent/90 shadow-lg">
          <Download className="w-4 h-4 mr-2" /> Tải README.md
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột chính: Nội dung tài liệu */}
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-900 text-white">
            <CardTitle>Cấu trúc & Luồng Logic</CardTitle>
            <CardDescription className="text-slate-400">Tài liệu dành riêng cho Quản trị viên</CardDescription>
          </CardHeader>
          <CardContent className="p-8 prose prose-slate max-w-none">
            <div className="space-y-10 text-sm leading-relaxed text-slate-600">
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" /> Luồng xử lý Giao dịch (Workflow)
                </h3>
                <div className="p-6 bg-slate-50 rounded-xl border flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">1</div>
                    <p><strong>Input:</strong> Gmail nhận thông báo biến động số dư từ Ngân hàng.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shrink-0">2</div>
                    <p><strong>Processing:</strong> Hệ thống sử dụng <strong>Genkit AI</strong> để trích xuất dữ liệu dựa trên <code>referencePrefix</code> của User.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">3</div>
                    <p><strong>Output:</strong> Gửi Webhook chứa dữ liệu trích xuất (Số tiền, Mã đơn,...) về Website đích.</p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-accent" /> Công nghệ AI tích hợp
                </h3>
                <p>Hệ thống không sử dụng Regex truyền thống để tránh sai sót. Chúng tôi sử dụng <strong>Google AI Gemini 2.5 Flash</strong> thông qua bộ công cụ <strong>Genkit</strong>. Điều này cho phép hệ thống hiểu được cả những nội dung email phức tạp nhất, tự động bỏ qua các thông báo rác và chỉ tập trung vào mã thanh toán hợp lệ.</p>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-500" /> Cơ sở dữ liệu (Firestore)
                </h3>
                <p>Dữ liệu được tổ chức theo cấu trúc phân cấp (Sub-collections):</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><code>/users/{'{uid}'}</code>: Thông tin gói cước và hạn mức của User.</li>
                  <li><code>/users/{'{uid}'}/webhookConfigurations</code>: Cấu hình Webhook riêng biệt cho từng website.</li>
                  <li><code>/users/{'{uid}'}/gmailListenerConfigurations</code>: Quản lý Token OAuth của Google.</li>
                </ul>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Cột phụ: Chỉ số & Trạng thái */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-500" /> Security Model
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded border">
                <strong>Webhook Security:</strong> Sử dụng Secret Token được gửi trong Header/Body để Website Merchant xác thực nguồn tin.
              </div>
              <div className="p-3 bg-slate-50 rounded border">
                <strong>OAuth 2.0:</strong> Không lưu mật khẩu Gmail của người dùng. Chỉ sử dụng Access Token với quyền <code>readonly</code>.
              </div>
              <div className="p-3 bg-slate-50 rounded border">
                <strong>Firebase Rules:</strong> Phân quyền nghiêm ngặt, chỉ cho phép User truy cập dữ liệu của chính mình.
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-accent text-white">
            <CardHeader>
              <CardTitle className="text-md">Lưu ý Vận hành</CardTitle>
            </CardHeader>
            <CardContent className="text-xs opacity-90 leading-relaxed">
              Hệ thống được thiết kế dưới dạng SaaS. Admin cần theo dõi trang &quot;Cảnh báo cước&quot; hàng ngày để nhắc nhở những người dùng sắp hết hạn mức thực hiện thanh toán, đảm bảo luồng doanh thu ổn định cho dịch vụ.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
