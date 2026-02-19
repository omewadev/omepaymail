
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save, Shield, Copy, FileCode, Globe, Code2, Hash } from "lucide-react";
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
  const [referencePrefix, setReferencePrefix] = useState("TT");

  const webhooksQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, "users", user.uid, "webhookConfigurations"), limit(1));
  }, [firestore, user?.uid]);

  const { data: webhooks, isLoading } = useCollection(webhooksQuery);

  useEffect(() => {
    if (webhooks && webhooks.length > 0) {
      setWebhookUrl(webhooks[0].targetUrl || "");
      setSecretKey(webhooks[0].secretToken || "");
      setReferencePrefix(webhooks[0].referencePrefix || "TT");
    } else if (user?.uid && !isLoading && (!webhooks || webhooks.length === 0)) {
      setSecretKey(`pmh_live_${Math.random().toString(36).substring(7)}`);
    }
  }, [webhooks, user?.uid, isLoading]);

  const handleSave = () => {
    if (!firestore || !user?.uid) return;

    const data = {
      targetUrl: webhookUrl,
      secretToken: secretKey,
      referencePrefix: referencePrefix.toUpperCase().trim(),
      updatedAt: new Date().toISOString()
    };

    if (webhooks && webhooks.length > 0) {
      const ref = doc(firestore, "users", user.uid, "webhookConfigurations", webhooks[0].id);
      updateDocumentNonBlocking(ref, data);
    } else {
      const colRef = collection(firestore, "users", user.uid, "webhookConfigurations");
      addDocumentNonBlocking(colRef, {
        ...data,
        name: "Main Webhook",
        isEnabled: true,
        createdAt: new Date().toISOString()
      });
    }

    toast({
      title: "Đã lưu cấu hình",
      description: "Hệ thống của bạn giờ đã có thể nhận dữ liệu với tiền tố mã " + referencePrefix,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: "Thông tin đã được lưu vào bộ nhớ tạm.",
    });
  };

  if (isLoading) return <div className="p-8 text-center">Đang tải cấu hình...</div>;

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-headline font-bold text-primary">Cấu hình hệ thống Merchant</h2>
        <p className="text-muted-foreground">Tùy chỉnh cách PayMailHook nhận dạng đơn hàng và gửi dữ liệu.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" />
              Nhận dạng & Bảo mật
            </CardTitle>
            <CardDescription>
              Thiết lập mã nhận diện đơn hàng để AI có thể trích xuất chính xác.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="ref-prefix" className="flex items-center gap-2">
                  <Hash className="w-4 h-4" /> Tiền tố mã đơn hàng (Prefix)
                </Label>
                <Input 
                  id="ref-prefix" 
                  placeholder="Ví dụ: TT, CG, DH, BILL" 
                  value={referencePrefix}
                  onChange={(e) => setReferencePrefix(e.target.value)}
                  className="font-bold uppercase"
                />
                <p className="text-[10px] text-muted-foreground">
                  AI sẽ tìm kiếm nội dung chuyển khoản bắt đầu bằng mã này (VD: <b>{referencePrefix}</b>123456).
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secret-key">Secret Key (Xác thực)</Label>
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
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook-url">URL Webhook nhận dữ liệu (Endpoint)</Label>
              <Input 
                id="webhook-url" 
                placeholder="https://your-domain.com/api/payment-webhook" 
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="font-mono text-sm"
              />
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
                  <FileCode className="w-4 h-4" /> Custom Web
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="wordpress" className="space-y-4 text-sm">
                <p>Để WordPress tự động duyệt đơn hàng, hãy thay mã <code>TT</code> trong code bằng tiền tố của bạn:</p>
                <div className="p-3 bg-slate-50 rounded border font-mono text-xs">
                  $referenceCode = $params['referenceCode'] ?? ''; <br/>
                  $order_id = str_replace('<b>{referencePrefix}</b>', '', $referenceCode);
                </div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-4 text-sm">
                <p>Dữ liệu JSON mẫu mà website bạn sẽ nhận được:</p>
                <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-[11px] overflow-x-auto">
{`{
  "amount": 500000,
  "referenceCode": "${referencePrefix}123456",
  "secretKey": "${secretKey || 'YOUR_KEY'}",
  "timestamp": "2024-03-20T10:30:00Z"
}`}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
