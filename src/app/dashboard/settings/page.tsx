
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save, Shield, Copy, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [webhookUrl, setWebhookUrl] = useState("https://your-wordpress-site.com/wp-json/paymail/v1/confirm");
  const [secretKey, setSecretKey] = useState("pmh_live_789xyz123abc");
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Đã lưu cấu hình",
      description: "Website WordPress của bạn giờ đã có thể nhận dữ liệu từ PayMailHook.",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: "Mã bí mật đã được lưu vào bộ nhớ tạm.",
    });
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-headline font-bold text-primary">Cài đặt hệ thống</h2>
        <p className="text-muted-foreground">Cấu hình cách PayMailHook giao tiếp với Website WordPress của bạn.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" />
              Kết nối WordPress Webhook
            </CardTitle>
            <CardDescription>
              Nhập đường dẫn API trên WordPress để chúng tôi gửi mã đối soát TTxxxxxx về.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">URL Webhook nhận dữ liệu</Label>
              <Input 
                id="webhook-url" 
                placeholder="https://..." 
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground italic">
                Mẹo: Bạn có thể sử dụng các Plugin như "WP Webhooks" để tạo đường dẫn này nhanh chóng.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secret-key">Secret Key (Mã bí mật)</Label>
              <div className="flex gap-2">
                <Input 
                  id="secret-key" 
                  readOnly 
                  value={secretKey}
                  className="bg-muted font-mono"
                />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(secretKey)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Sử dụng mã này trên WordPress để xác thực rằng dữ liệu được gửi từ đúng hệ thống PayMailHook.
              </p>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-end">
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
              <Save className="w-4 h-4 mr-2" /> Lưu cấu hình
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-none shadow-md bg-secondary/30">
          <CardHeader>
            <CardTitle className="text-lg">Hướng dẫn cho WordPress</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-primary shrink-0 shadow-sm">1</div>
              <p className="pt-1">Cài đặt Plugin xử lý Webhook trên WordPress (ví dụ: WP Webhooks).</p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-primary shrink-0 shadow-sm">2</div>
              <p className="pt-1">Tạo một Action "Receive Data" và dán URL vào ô phía trên.</p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-primary shrink-0 shadow-sm">3</div>
              <p className="pt-1">Khi nhận được dữ liệu, hãy tìm đơn hàng có mã trùng với <code className="bg-white px-1 rounded">referenceCode</code> (có dạng TTxxxxxx) và cập nhật trạng thái.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
