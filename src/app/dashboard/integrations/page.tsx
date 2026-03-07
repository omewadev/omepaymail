
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, RefreshCw, ShieldCheck, Zap, CheckCircle2, Globe, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { collection, query, limit, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function IntegrationsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const gmailQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, "users", user.uid, "gmailListenerConfigurations"), limit(1));
  }, [firestore, user?.uid]);

  const { data: gmailConfigs, isLoading } = useCollection(gmailQuery);
  const config = gmailConfigs?.[0];
  const isConnected = !!config?.isEnabled;

  const handleToggleConnect = () => {
    if (!firestore || !user?.uid) return;

    if (isConnected) {
      // Giả lập ngắt kết nối
      const ref = doc(firestore, "users", user.uid, "gmailListenerConfigurations", config.id);
      updateDocumentNonBlocking(ref, { isEnabled: false, updatedAt: new Date().toISOString() });
      toast({ title: "Đã ngắt kết nối Gmail" });
    } else {
      // Giả lập kết nối OAuth
      const data = {
        monitoredEmailAddress: user.email || "user@gmail.com",
        isEnabled: true,
        bankSenderEmailPatterns: ["no-reply@bank.com", "ebanking@notification.vn"],
        confirmationKeywords: ["chuyen tien", "biendoi", "received"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (config) {
        const ref = doc(firestore, "users", user.uid, "gmailListenerConfigurations", config.id);
        updateDocumentNonBlocking(ref, data);
      } else {
        const colRef = collection(firestore, "users", user.uid, "gmailListenerConfigurations");
        addDocumentNonBlocking(colRef, data);
      }
      
      toast({
        title: "Kết nối thành công!",
        description: "Hệ thống đã được cấp quyền đọc email thông báo biến động số dư.",
      });
    }
  };

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto w-8 h-8 text-accent" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-primary">Kết nối Gmail Real-time</h2>
          <p className="text-muted-foreground">Sử dụng Google OAuth 2.0 để phát hiện email ngân hàng tức thì.</p>
        </div>
        {isConnected && (
          <Button variant="outline" className="border-accent text-accent" onClick={handleToggleConnect}>
            <RefreshCw className="w-4 h-4 mr-2" /> Ngắt kết nối
          </Button>
        )}
      </div>

      {!isConnected && (
        <Alert className="bg-primary/5 border-primary/20">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary font-bold">Lưu ý quan trọng</AlertTitle>
          <AlertDescription className="text-sm">
            Hệ thống <b>KHÔNG</b> yêu cầu bạn nhập mật khẩu Gmail. Bạn sẽ được chuyển hướng sang trang xác thực an toàn của Google để cấp quyền đọc thư.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-md overflow-hidden">
          <div className="h-1 bg-accent" />
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isConnected ? 'bg-green-100' : 'bg-accent/10'}`}>
                <Mail className={`${isConnected ? 'text-green-600' : 'text-accent'} w-7 h-7`} />
              </div>
              <div>
                <CardTitle>Xác thực Google OAuth 2.0</CardTitle>
                <CardDescription>
                  Trạng thái: {isConnected ? 
                    <Badge className="bg-green-500">ĐANG HOẠT ĐỘNG</Badge> : 
                    <Badge variant="destructive">CHƯA CẤU HÌNH</Badge>
                  }
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-6">
              <h4 className="font-bold text-lg text-primary flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" /> Quy trình kết nối 3 bước:
              </h4>
              
              <div className="grid gap-6">
                <div className="flex gap-4 group">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0 font-bold group-hover:scale-110 transition-transform">1</div>
                  <div>
                    <p className="font-bold">Bấm nút &quot;Kết nối với Google&quot;</p>
                    <p className="text-sm text-muted-foreground">Bạn sẽ được chuyển sang trang <code>accounts.google.com</code> của Google.</p>
                  </div>
                </div>
                
                <div className="flex gap-4 group">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0 font-bold group-hover:scale-110 transition-transform">2</div>
                  <div>
                    <p className="font-bold">Chọn tài khoản & Cấp quyền</p>
                    <p className="text-sm text-muted-foreground">Chọn email nhận thông báo ngân hàng và tích chọn quyền <code>gmail.readonly</code>.</p>
                  </div>
                </div>

                <div className="flex gap-4 group">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0 font-bold group-hover:scale-110 transition-transform">3</div>
                  <div>
                    <p className="font-bold">Hoàn tất & Tự động hóa</p>
                    <p className="text-sm text-muted-foreground">Hệ thống nhận Token và bắt đầu lắng nghe các biến động số dư ngân hàng.</p>
                  </div>
                </div>
              </div>

              {!isConnected ? (
                <Button 
                  size="lg" 
                  className="w-full bg-accent hover:bg-accent/90 h-16 text-lg font-bold shadow-lg shadow-accent/20"
                  onClick={handleToggleConnect}
                >
                  <Mail className="mr-3 w-6 h-6" /> Kết nối ngay với Google
                </Button>
              ) : (
                <div className="bg-green-50 p-6 rounded-xl flex items-center gap-4 text-green-700 border border-green-200 animate-in zoom-in-95">
                  <CheckCircle2 className="w-8 h-8" />
                  <div className="flex-1">
                    <p className="font-bold text-lg">Đã thiết lập thành công!</p>
                    <p className="text-sm opacity-90 font-medium">Đang lắng nghe hòm thư: <span className="underline italic">{config.monitoredEmailAddress}</span></p>
                  </div>
                </div>
              )}
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
