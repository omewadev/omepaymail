"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save, Shield, Copy, FileCode, Globe, Code2, Hash, Loader2, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useUser, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase";
import { collection, query, limit, doc } from "firebase/firestore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FormState {
  webhookUrl: string;
  secretKey: string;
  referencePrefix: string;
  id: string | null;
}

export default function SettingsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [formState, setFormState] = useState<FormState | null>(null);

  const webhooksQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, "users", user.uid, "webhookConfigurations"), limit(1));
  }, [firestore, user?.uid]);

  const { data: webhooks, isLoading } = useCollection(webhooksQuery);

  // Đã sửa lại logic useEffect để chống kẹt vòng lặp
  useEffect(() => {
    if (isLoading) return; // Đợi Firebase tải xong
    if (formState !== null) return; // Nếu đã có data trong form thì không chạy lại nữa

    if (webhooks && webhooks.length > 0) {
      const initialData = webhooks[0];
      setFormState({
        webhookUrl: initialData.targetUrl || "",
        secretKey: initialData.secretToken || "",
        referencePrefix: initialData.referencePrefix || "TT",
        id: initialData.id
      });
    } else {
      // Tạo cấu hình mặc định nếu user chưa có
      setFormState({
        webhookUrl: "",
        secretKey: `pmh_live_${Math.random().toString(36).substring(7)}`,
        referencePrefix: "TT",
        id: null
      });
    }
  },[isLoading, webhooks, formState]);

  const handleFieldChange = (field: keyof FormState, value: string) => {
    setFormState(prevState => prevState ? { ...prevState, [field]: value } : null);
  };

  const handleSave = () => {
    const currentUid = user?.uid || "test-user-123"; // Dùng test user nếu chưa đăng nhập
    if (!firestore || !formState) return;

    const data = {
      targetUrl: formState.webhookUrl,
      secretToken: formState.secretKey,
      referencePrefix: formState.referencePrefix.toUpperCase().trim(),
      updatedAt: new Date().toISOString()
    };

    if (formState.id) {
      const ref = doc(firestore, "users", currentUid, "webhookConfigurations", formState.id);
      updateDocumentNonBlocking(ref, data);
    } else {
      const colRef = collection(firestore, "users", currentUid, "webhookConfigurations");
      addDocumentNonBlocking(colRef, {
        ...data,
        name: "Main Webhook",
        isEnabled: true,
        createdAt: new Date().toISOString()
      });
    }

    toast({
      title: "Đã lưu cấu hình",
      description: "Hệ thống của bạn giờ đã có thể nhận dữ liệu với tiền tố mã " + formState.referencePrefix,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: "Thông tin đã được lưu vào bộ nhớ tạm.",
    });
  };

  if (isLoading || !formState) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-muted-foreground">Đang tải cấu hình...</p>
      </div>
    );
  }

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
                  value={formState.referencePrefix}
                  onChange={(e) => handleFieldChange('referencePrefix', e.target.value)}
                  className="font-bold uppercase"
                />
                <p className="text-[10px] text-muted-foreground">
                  AI sẽ tìm kiếm nội dung chuyển khoản bắt đầu bằng mã này (VD: <b>{formState.referencePrefix}</b>123456).
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secret-key">Secret Key (Xác thực)</Label>
                <div className="flex gap-2">
                  <Input 
                    id="secret-key" 
                    readOnly 
                    value={formState.secretKey}
                    className="bg-muted font-mono"
                  />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(formState.secretKey)}>
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
                value={formState.webhookUrl}
                onChange={(e) => handleFieldChange('webhookUrl', e.target.value)}
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
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Code2 className="w-5 h-5 text-accent" /> 
              Tài liệu & Hướng dẫn
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="font-bold text-muted-foreground hover:text-primary">
                <Link href="/docs" target="_blank">
                  <FileCode className="w-4 h-4 mr-2" /> Tài liệu API
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="font-bold border-primary text-primary hover:bg-primary/5">
                <Link href="/huong-dan" target="_blank">
                  <BookOpen className="w-4 h-4 mr-2" /> Hướng dẫn Cài đặt
                </Link>
              </Button>
            </div>
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
                  {`$referenceCode = $params['referenceCode'] ?? '';`}
                  <br />
                  {`$order_id = str_replace('`}<b>{formState.referencePrefix}</b>{`', '', $referenceCode);`}
                </div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-4 text-sm">
                <p>Dữ liệu JSON mẫu mà website của bạn sẽ nhận được:</p>
                <pre className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-[11px] overflow-x-auto">
{`{
  "amount": 500000,
  "referenceCode": "${formState.referencePrefix}123456",
  "secretKey": "${formState.secretKey || 'YOUR_KEY'}",
  "timestamp": "2024-03-20T10:30:00Z"
}`}
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}