
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Webhook, Plus, Trash2, Send, ExternalLink, Shield, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState([
    { id: 1, name: "Website WordPress", url: "https://yourshop.com/wp-json/paymailhook/v1/verify", active: true, events: ["Payment Received"] },
  ]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline font-bold text-primary">Webhooks</h2>
          <p className="text-muted-foreground">Nơi nhận dữ liệu mã TTxxxxxx để website WordPress của bạn tự động xử lý đơn hàng.</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90">
          <Plus className="w-4 h-4 mr-2" /> Thêm Endpoint mới
        </Button>
      </div>

      <Alert className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary font-bold">Dành cho người dùng WordPress</AlertTitle>
        <AlertDescription className="text-sm">
          Bạn cần cài đặt một Plugin hỗ trợ Webhook hoặc thêm một đoạn mã vào <code>functions.php</code> để lắng nghe dữ liệu từ PayMailHook gửi về. Mã <b>TTxxxxxx</b> sẽ nằm trong trường <code>referenceCode</code> của gói dữ liệu.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-6">
        {webhooks.map((hook) => (
          <Card key={hook.id} className="border-none shadow-md overflow-hidden">
            <div className="h-1 bg-accent" />
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{hook.name}</CardTitle>
                  <Badge variant={hook.active ? "default" : "secondary"}>
                    {hook.active ? "Đang chạy" : "Tạm dừng"}
                  </Badge>
                </div>
                <CardDescription className="font-mono text-xs flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> {hook.url}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={hook.active} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {hook.events.map(event => (
                    <Badge key={event} variant="outline" className="bg-secondary/50 text-accent border-accent/20">
                      {event}
                    </Badge>
                  ))}
                </div>
                <div className="p-3 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/20">
                  <p className="text-[10px] text-muted-foreground mb-1 uppercase font-bold tracking-wider">Dữ liệu mẫu gửi về WordPress:</p>
                  <pre className="text-[11px] font-mono text-primary/80 overflow-x-auto">
{`{
  "amount": 500000,
  "referenceCode": "TT123456",
  "sender": "NGUYEN VAN A",
  "status": "completed"
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t flex justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  <Send className="w-4 h-4 mr-2" /> Test Webhook
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  <Shield className="w-4 h-4 mr-2" /> Lấy Secret Key
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/5">
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
