"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save, Shield, Copy, FileCode, Globe, Code2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase";
import { collection, query, limit, doc } from "firebase/firestore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [secretKey, setSecretKey] = useState("");

  const webhooksQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, "users", user.uid, "webhookConfigurations"), limit(1));
  }, [firestore, user?.uid]);

  const { data: webhooks, isLoading } = useCollection(webhooksQuery);

  useEffect(() => {
    if (webhooks && webhooks.length > 0) {
      setWebhookUrl(webhooks[0].targetUrl || "");
      setSecretKey(webhooks[0].secretToken || "");
    } else if (user?.uid && !isLoading && (!webhooks || webhooks.length === 0)) {
      setSecretKey(`pmh_live_${Math.random().toString(36).substring(7)}`);
    }
  }, [webhooks, user?.uid, isLoading]);

  const handleSave = () => {
    if (!firestore || !user?.uid) return;

    if (webhooks && webhooks.length > 0) {
      const ref = doc(firestore, "users", user.uid, "webhookConfigurations", webhooks[0].id);
      updateDocumentNonBlocking(ref, {
        targetUrl: webhookUrl,
        secretToken: secretKey,
        updatedAt: new Date().toISOString()
      });
    } else {
      const colRef = collection(firestore, "users", user.uid, "webhookConfigurations");
      addDocumentNonBlocking(colRef, {
        name: "Main Webhook",
        targetUrl: webhookUrl,
        secretToken: secretKey,
        isEnabled: true,
        createdAt: new Date().toISOString()
      });
    }

    toast({
      title: "Đã lưu cấu hình",
      description: "Hệ thống của bạn giờ đã có thể nhận dữ liệu từ PayMailHook.",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: "Thông tin đã được lưu vào bộ nhớ tạm.",
    });
  };

  if (isLoading) return <div className="p-8">Đang tải cấu hình...</div>;

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-headline font-bold text-primary">Cài đặt kết nối Merchant</h2>
        <p className="text-muted-foreground">Cấu hình cách PayMailHook giao tiếp với Website hoặc Ứng dụng của bạn.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" />
              Cấu hình Webhook Endpoint
            </CardTitle>
            <CardDescription>
              Nhập đường dẫn API (Webhook) trên hệ thống của bạn để chúng tôi gửi mã đối soát giao dịch về.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">URL Webhook nhận dữ liệu (Endpoint)</Label>
              <Input 
                id="webhook-url" 
                placeholder="https://your-domain.com/api/payment-webhook" 
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground italic">
                Hệ thống sẽ gửi yêu cầu POST JSON kèm theo mã tham chiếu giao dịch.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secret-key">Secret Key (Xác thực bảo mật)</Label>
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
                Sử dụng mã này để xác minh tính toàn vẹn của dữ liệu gửi từ PayMailHook.
              </p>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-end">
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
              <Save className="w-4 h-4 mr-2" /> Lưu cấu hình
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Code2 className="w-5 h-5 text-accent" /> 
              Hướng dẫn tích hợp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="wordpress" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="wordpress" className="font-bold flex gap-2">
                  <Globe className="w-4 h-4" /> WordPress
                </TabsTrigger>
                <TabsTrigger value="custom" className="font-bold flex gap-2">
                  <FileCode className="w-4 h-4" /> Website khác
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="wordpress" className="space-y-4 text-sm">
                <p>Để WordPress tự động duyệt đơn hàng, hãy làm theo các bước:</p>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0">1</div>
                  <p>Mở file <code>docs/wordpress-integration-sample.php</code> trong bộ mã nguồn này.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0">2</div>
                  <p>Dán vào file <b>functions.php</b> của Theme hoặc dùng Plugin <b>Code Snippets</b>.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0">3</div>
                  <p>Thay thế <code>Secret Key</code> bằng mã bạn vừa sao chép ở trên.</p>
                </div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-4 text-sm">
                <p>Đối với Website tùy chỉnh, bạn cần viết một hàm đón yêu cầu <b>POST</b> với dữ liệu JSON:</p>
                <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-[11px] overflow-x-auto">
{`{
  "amount": 500000,
  "referenceCode": "TT123456",
  "senderName": "NGUYEN VAN A",
  "secretKey": "${secretKey || 'YOUR_KEY'}",
  "timestamp": "2024-03-20T10:30:00Z"
}`}
                </div>
                <p className="text-muted-foreground italic">Gợi ý: Kiểm tra mã "referenceCode" để biết đơn hàng nào cần được xác nhận thành công.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
