"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Webhook, Plus, Trash2, Send, ExternalLink, Shield, Info, Copy, Check, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function WebhooksPage() {
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState([
    { id: 1, name: "Merchant API Endpoint", url: "https://your-app.com/api/pay-callback", active: true, events: ["New Bank Transfer"] },
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
          <h2 className="text-3xl font-headline font-bold text-primary">Quản lý Webhooks</h2>
          <p className="text-muted-foreground">Khai báo các Endpoint sẽ nhận dữ liệu đối soát tự động.</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90 font-bold h-12">
          <Plus className="w-5 h-5 mr-2" /> Thêm Endpoint mới
        </Button>
      </div>

      <Alert className="bg-primary/5 border-primary/20">
        <Terminal className="h-5 w-5 text-primary" />
        <AlertTitle className="text-primary font-bold text-lg">Cơ chế hoạt động chung</AlertTitle>
        <AlertDescription className="text-base mt-2">
          Khi AI phát hiện giao dịch, hệ thống sẽ gửi gói tin JSON chứa mã tham chiếu (ví dụ: <b>TT123456</b>) về Endpoint của bạn. Website của bạn cần xử lý yêu cầu này để tự động hóa quy trình bán hàng.
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
                    {hook.active ? "Đang hoạt động" : "Tạm dừng"}
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
                    <Shield className="w-4 h-4" /> Payload & Security
                  </h4>
                  <p className="text-sm text-muted-foreground">Mọi yêu cầu đều được gửi qua HTTPS POST với định dạng JSON, đi kèm Secret Key để bảo mật hệ thống của bạn.</p>
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
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Dữ liệu JSON mẫu</p>
                    <Badge variant="outline" className="text-[9px] text-slate-400 border-slate-700">POST</Badge>
                  </div>
                  <pre className="text-[12px] font-mono text-green-400 overflow-x-auto leading-relaxed">
{`{
  "amount": 500000,
  "referenceCode": "TT123456",
  "senderName": "NGUYEN VAN A",
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
                  <Info className="w-4 h-4 mr-2" /> Lịch sử Webhook
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
