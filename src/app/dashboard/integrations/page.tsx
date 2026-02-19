
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, RefreshCw, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function IntegrationsPage() {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline font-bold text-primary">Kết nối Gmail</h2>
          <p className="text-muted-foreground">App sẽ đọc email ngân hàng để tự động đối soát mã <span className="font-bold text-accent">TTxxxxxx</span>.</p>
        </div>
        {isConnected && (
          <Button variant="outline" className="border-accent text-accent">
            <RefreshCw className="w-4 h-4 mr-2" /> Làm mới kết nối
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-none shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isConnected ? 'bg-green-100' : 'bg-accent/10'}`}>
                  <Mail className={`${isConnected ? 'text-green-600' : 'text-accent'} w-6 h-6`} />
                </div>
                <div>
                  <CardTitle>Xác thực Google OAuth 2.0</CardTitle>
                  <CardDescription>
                    Trạng thái: {isConnected ? 
                      <Badge className="bg-green-500">ĐÃ KẾT NỐI</Badge> : 
                      <Badge variant="destructive">CHƯA KẾT NỐI</Badge>
                    }
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 border rounded-xl bg-muted/30 space-y-6">
              <h3 className="font-bold text-lg">Quy trình kết nối bảo mật:</h3>
              <div className="grid gap-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0">1</div>
                  <p className="text-sm">Bấm nút <b>"Kết nối với Google"</b> bên dưới. Bạn sẽ được chuyển sang trang xác thực chính thức của Google.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0">2</div>
                  <p className="text-sm">Chọn tài khoản Gmail nhận thông báo từ ngân hàng. Google sẽ hỏi bạn quyền <b>"Read-only email"</b>.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0">3</div>
                  <p className="text-sm">Sau khi đồng ý, bạn sẽ được đưa quay lại đây. Hệ thống sẽ tự động bắt đầu quét mã <b>TTxxxxxx</b> từ giây phút này.</p>
                </div>
              </div>
              
              {!isConnected ? (
                <Button 
                  size="lg" 
                  className="w-full bg-accent hover:bg-accent/90 mt-4 h-14 text-lg"
                  onClick={() => setIsConnected(true)}
                >
                  <Mail className="mr-2" /> Kết nối với Google Gmail
                </Button>
              ) : (
                <div className="bg-green-50 p-4 rounded-lg flex items-center gap-3 text-green-700 border border-green-200">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Đã kết nối thành công: user@gmail.com</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md flex flex-col justify-center p-8 bg-background border border-border">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">An toàn tuyệt đối</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Chúng tôi <b>không bao giờ</b> lưu mật khẩu Gmail của bạn. Quyền truy cập có thể bị thu hồi bất cứ lúc nào trong cài đặt tài khoản Google của bạn.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="w-3 h-3" /> Chuẩn bảo mật OAuth 2.0
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
