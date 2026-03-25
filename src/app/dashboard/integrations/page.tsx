"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, ShieldCheck, Zap, Globe, Copy, Info, Send, Loader2, AlertTriangle, BookOpen } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"; // Thêm useDoc và useMemoFirebase
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { triggerInboundTest } from "@/app/actions/test-inbound";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { doc } from "firebase/firestore"; // Thêm doc

export default function IntegrationsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const[isTesting, setIsTesting] = useState(false);
  
  // Tạo địa chỉ email ảo dựa trên UID của user (Đã cập nhật theo Cloudflare Routing)
  const forwardEmail = user?.uid ? `inbound+${user.uid}@omewa.vn` : "Đang tải...";

  // Lấy thông tin user profile để hiển thị OTP
  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user?.uid]);
  const { data: userProfile, isLoading: isLoadingUserProfile } = useDoc(userProfileRef);
  const latestOtp = userProfile?.latestGmailForwardingOtp;
  const otpUpdatedAt = userProfile?.otpUpdatedAt;

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: "Đã lưu vào bộ nhớ tạm.",
    });
  };

  // Hàm giả lập có một email ngân hàng gửi tới (Đã cập nhật dùng Server Action)
  const handleTestInbound = async () => {
    if (!user?.uid) return;
    setIsTesting(true);
    try {
      const result = await triggerInboundTest(forwardEmail);

      if (result.success) {
        toast({ 
          title: "Test thành công!", 
          description: "Hệ thống AI đã nhận email giả lập và đang xử lý." 
        });
      } else {
        toast({ variant: "destructive", title: "Lỗi", description: result.error || "Có lỗi xảy ra" });
      }
    } catch (error: any) {
      console.error("[Test Inbound Error]:", error);
      toast({ 
        variant: "destructive", 
        title: "Lỗi Server (500)", 
        description: error.message || "Mất kết nối API. Sếp hãy kiểm tra lại Terminal xem có thiếu GOOGLE_API_KEY không nhé." 
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoadingUserProfile) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto w-8 h-8 text-accent" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-primary">Tích hợp Email Forwarding</h2>
          <p className="text-muted-foreground">Tự động hóa an toàn 100% không cần cấp quyền truy cập mật khẩu Gmail.</p>
        </div>
        <Button asChild variant="outline" className="h-12 font-bold border-primary text-primary hover:bg-primary/5">
          <Link href="/huong-dan" target="_blank">
            <BookOpen className="w-5 h-5 mr-2" /> Xem Hướng dẫn
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-md overflow-hidden">
          <div className="h-1 bg-accent" />
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-green-100">
                <Mail className="text-green-600 w-7 h-7" />
              </div>
              <div>
                <CardTitle>Địa chỉ nhận thông báo của bạn</CardTitle>
                <CardDescription>
                  Hãy cài đặt chuyển tiếp (Auto-Forward) email từ ngân hàng vào địa chỉ dưới đây.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            
          <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 w-full overflow-hidden">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Email Forwarding duy nhất của bạn</p>
                <p className="text-lg font-mono text-green-400 truncate">{forwardEmail}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button onClick={() => copyToClipboard(forwardEmail)} className="bg-accent hover:bg-accent/90">
                  <Copy className="w-4 h-4 mr-2" /> Sao chép
                </Button>
                <Button onClick={handleTestInbound} disabled={isTesting} variant="outline" className="text-slate-900">
                  {isTesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Gửi Test
                </Button>
              </div>
            </div>

            {/* NEW: Display OTP section */}
            {latestOtp && (
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800 font-bold text-sm">Mã xác nhận Gmail của bạn</AlertTitle>
                <AlertDescription className="text-blue-700 text-xs mt-1 flex items-center justify-between">
                  <span className="font-mono text-base font-bold">{latestOtp}</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(latestOtp)} className="text-blue-600 hover:bg-blue-100">
                    <Copy className="w-3 h-3 mr-1" /> Sao chép mã
                  </Button>
                </AlertDescription>
                {otpUpdatedAt && (
                  <p className="text-xs text-blue-500 mt-2">Cập nhật lúc: {new Date(otpUpdatedAt).toLocaleString()}</p>
                )}
              </Alert>
            )}

            <div className="space-y-6">
              <h4 className="font-bold text-lg text-primary flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" /> Hướng dẫn cài đặt trên Gmail (3 Bước):
              </h4>
              
              <div className="grid gap-6">
                <div className="flex gap-4 group">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0 font-bold group-hover:scale-110 transition-transform">1</div>
                  <div>
                    <p className="font-bold">Thêm địa chỉ chuyển tiếp</p>
                    <p className="text-sm text-muted-foreground">Vào Cài đặt Gmail {'>'} Chuyển tiếp và POP/IMAP {'>'} Thêm địa chỉ chuyển tiếp. Dán email màu xanh ở trên vào.</p>
                  </div>
                </div>
                
                <div className="flex gap-4 group">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0 font-bold group-hover:scale-110 transition-transform">2</div>
                  <div>
                    <p className="font-bold">Xác nhận mã từ PayMailHook</p>
                    <p className="text-sm text-muted-foreground">Gmail sẽ gửi một mã xác nhận. Hệ thống AI của chúng tôi sẽ tự động duyệt mã này cho bạn trong vòng 1 phút.</p>
                  </div>
                </div>

                <div className="flex gap-4 group">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0 font-bold group-hover:scale-110 transition-transform">3</div>
                  <div className="space-y-2">
                    <p className="font-bold">Tạo bộ lọc (Filter) cho Ngân hàng <span className="text-red-500">*Quan trọng*</span></p>
                    <p className="text-sm text-muted-foreground">Vào ô tìm kiếm của Gmail, bấm biểu tượng tùy chọn. Nhập email của ngân hàng vào ô <b>"Từ"</b> (VD: <i>no-reply@mbbank.com.vn</i>). Bấm <b>"Tạo bộ lọc"</b>.</p>
                    <p className="text-sm text-muted-foreground">Tích chọn <b>"Chuyển tiếp đến:"</b> và chọn địa chỉ email ảo của bạn. Bấm <b>"Tạo bộ lọc"</b> để hoàn tất.</p>
                    
                    <Alert className="bg-amber-50 border-amber-200 mt-3">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertTitle className="text-amber-800 font-bold text-sm">Cảnh báo chống Spam (Tiết kiệm Hạn mức)</AlertTitle>
                      <AlertDescription className="text-amber-700 text-xs mt-1">
                        TUYỆT ĐỐI KHÔNG chọn "Chuyển tiếp tất cả email". Việc forward email rác/quảng cáo vào hệ thống sẽ làm cạn kiệt "Hạn mức giao dịch" của bạn rất nhanh do AI vẫn phải đọc và xử lý.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-md p-6 bg-slate-900 text-white">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold">An toàn & Riêng tư</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Chúng tôi không bao giờ lưu mật khẩu Gmail của bạn. Quyền truy cập có thể bị hủy bất cứ lúc nào từ trang quản lý tài khoản Google của bạn.
              </p>
            </div>
          </Card>

          <Card className="border-none shadow-md p-6 bg-accent text-white">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                <h3 className="font-bold">Tương thích WordPress</h3>
              </div>
              <p className="text-sm opacity-90 leading-relaxed">
                Khi AI phát hiện mã tham chiếu hợp lệ, nó sẽ ngay lập tức gửi dữ liệu về website WordPress để khớp với đơn hàng tương ứng. Đảm bảo bạn đã cấu hình URL Webhook.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}