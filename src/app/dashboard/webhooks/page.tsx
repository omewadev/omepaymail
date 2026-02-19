
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Webhook, Plus, Trash2, Send, ExternalLink, Shield, Info, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function WebhooksPage() {
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState([
    { id: 1, name: "Website WordPress", url: "https://shop-cua-ban.com/wp-json/paymail/v1/confirm", active: true, events: ["Chuyển khoản đến"] },
  ]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: "Đã lưu vào bộ nhớ tạm.",
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-primary">Cấu hình Webhooks</h2>
          <p className="text-muted-foreground">Khai báo nơi PayMailHook sẽ bắn dữ liệu mã TTxxxxxx về.</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90 font-bold h-12">
          <Plus className="w-5 h-5 mr-2" /> Thêm Endpoint mới
        </Button>
      </div>

      <Alert className="bg-primary/5 border-primary/20">
        <Info className="h-5 w-5 text-primary" />
        <AlertTitle className="text-primary font-bold text-lg">Hướng dẫn cho WordPress</AlertTitle>
        <AlertDescription className="text-base mt-2">
          Hệ thống sẽ gửi một gói tin JSON chứa mã <b>TT123456</b> về website của bạn. Website của bạn cần một "tai lắng nghe" (Endpoint) để nhận mã này và tự động chuyển trạng thái đơn hàng tương ứng.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-8">
        {webhooks.map((hook) => (
          <Card key={hook.id} className="border-none shadow-lg overflow-hidden transition-all hover:shadow-xl">
            <div className="h-2 bg-gradient-to-r from-primary to-accent" />
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-xl font-bold">{hook.name}</CardTitle>
                  <Badge className={hook.active ? "bg-green-500 hover:bg-green-600" : "bg-slate-400"}>
                    {hook.active ? "Đang chạy" : "Tạm dừng"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm bg-muted/50 p-2 rounded-md border">
                  <ExternalLink className="w-4 h-4" /> 
                  <span className="truncate">{hook.url}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => copyToClipboard(hook.url)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Label className="font-bold">Kích hoạt</Label>
                <Switch checked={hook.active} />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-bold text-primary flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Bảo mật & Xác thực
                  </h4>
                  <p className="text-sm text-muted-foreground">Mỗi gói tin gửi đi đều đi kèm <code>Secret Key</code> để website WordPress của bạn xác minh dữ liệu đúng từ PayMailHook.</p>
                  <div className="flex flex-wrap gap-2">
                    {hook.events.map(event => (
                      <Badge key={event} variant="outline" className="bg-accent/5 text-accent border-accent/20 font-bold px-3 py-1">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-inner">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Dữ liệu mẫu (JSON)</p>
                    <Badge variant="outline" className="text-[9px] text-slate-400 border-slate-700">HTTPS POST</Badge>
                  </div>
                  <pre className="text-[12px] font-mono text-green-400 overflow-x-auto leading-relaxed">
{`{
  "amount": 500000,
  "referenceCode": "TT123456",
  "sender": "NGUYEN VAN A",
  "secretKey": "pmh_live_..."
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t flex flex-wrap justify-between items-center gap-4 px-8 py-6">
              <div className="flex items-center gap-6">
                <Button variant="ghost" size="sm" className="font-bold text-primary hover:bg-primary/5">
                  <Send className="w-4 h-4 mr-2" /> Gửi thử (Test)
                </Button>
                <Button variant="ghost" size="sm" className="font-bold text-primary hover:bg-primary/5">
                  <Info className="w-4 h-4 mr-2" /> Nhật ký bắn Webhook
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 font-bold">
                <Trash2 className="w-4 h-4 mr-2" /> Xóa Endpoint
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
