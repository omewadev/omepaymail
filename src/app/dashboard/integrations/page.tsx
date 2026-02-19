
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, RefreshCw, ShieldCheck, Zap, CheckCircle2, Globe } from "lucide-react";
import { useState } from "react";

export default function IntegrationsPage() {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline font-bold text-primary">Kết nối Gmail Real-time</h2>
          <p className="text-muted-foreground">Sử dụng Google Pub/Sub để phát hiện email ngân hàng tức thì (3-5 giây).</p>
        </div>
        {isConnected && (
          <Button variant="outline" className="border-accent text-accent">
            <RefreshCw className="w-4 h-4 mr-2" /> Làm mới Token
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
                      <Badge className="bg-green-500">ĐANG HOẠT ĐỘNG</Badge> : 
                      <Badge variant="destructive">CHƯA CẤU HÌNH</Badge>
                    }
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 border rounded-xl bg-muted/30 space-y-6">
              <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                <Zap className="w-5 h-5 text-primary mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-primary">Cơ chế Push Notification</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Hệ thống không quét email theo cách thủ công. Ngay khi ngân hàng gửi mail, Google sẽ chủ động thông báo cho PayMailHook xử lý. Đảm bảo độ trễ thấp nhất thị trường.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0">1</div>
                  <p className="text-sm">Bấm <b>"Kết nối với Google"</b> và cấp quyền <code>gmail.readonly</code>.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0">2</div>
                  <p className="text-sm">Hệ thống đăng ký <b>Watch</b> với Google Cloud Pub/Sub cho hòm thư của bạn.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0">3</div>
                  <p className="text-sm">Kể từ bây giờ, mọi mã <b>TTxxxxxx</b> về mail sẽ tự động bắn sang WordPress.</p>
                </div>
              </div>
              
              {!isConnected ? (
                <Button 
                  size="lg" 
                  className="w-full bg-accent hover:bg-accent/90 mt-4 h-14 text-lg"
                  onClick={() => setIsConnected(true)}
                >
                  <Mail className="mr-2" /> Bắt đầu kết nối Gmail
                </Button>
              ) : (
                <div className="bg-green-50 p-4 rounded-lg flex items-center gap-3 text-green-700 border border-green-200">
                  <CheckCircle2 className="w-5 h-5" />
                  <div className="flex-1">
                    <span className="font-medium">Đã thiết lập Webhook Gmail tức thì cho: shop-admin@gmail.com</span>
                    <p className="text-xs opacity-80">Lần cuối nhận tín hiệu: Vừa xong</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-md p-6 bg-white">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">An toàn tối đa</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Chúng tôi sử dụng cơ chế <b>Short-lived Access Tokens</b>. Quyền truy cập email của bạn được quản lý bởi Google, bạn có thể ngắt kết nối bất cứ lúc nào tại <i>Google Account Settings</i>.
              </p>
            </div>
          </Card>

          <Card className="border-none shadow-md p-6 bg-accent text-white">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                <h3 className="font-bold">WordPress Sync</h3>
              </div>
              <p className="text-xs opacity-90">
                Khi có mail, hệ thống sẽ gửi gói tin JSON kèm mã <b>TTxxxxxx</b> về website của bạn. Đảm bảo bạn đã dán code PHP mẫu vào WordPress.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
