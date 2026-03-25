"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Send, ExternalLink, Shield, Info, Copy, Terminal, BookOpen, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { collection, query, limit } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendTestWebhook } from "@/app/actions/send-test-webhook";

export default function WebhooksPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [newWebhookData, setNewWebhookData] = useState({ name: "My Website", url: "" });

  const webhooksQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, "users", user.uid, "webhookConfigurations"), limit(1));
  }, [firestore, user?.uid]);

  const { data: webhooksData, isLoading } = useCollection(webhooksQuery);
  const hook = webhooksData?.[0];

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: "Đã lưu vào bộ nhớ tạm.",
    });
  };

  const handleAddWebhook = () => {
    if (!firestore || !user?.uid || !newWebhookData.url) {
      toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng nhập URL Webhook." });
      return;
    }
    const colRef = collection(firestore, "users", user.uid, "webhookConfigurations");
    addDocumentNonBlocking(colRef, {
      name: newWebhookData.name,
      targetUrl: newWebhookData.url,
      secretToken: `pmh_live_${Math.random().toString(36).substring(7)}`,
      referencePrefix: "TT",
      isEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    toast({ title: "Thành công", description: "Đã thêm Endpoint mới." });
    setIsAddDialogOpen(false);
    setNewWebhookData({ name: "My Website", url: "" });
  };

  const handleSendTest = async () => {
    if (!user?.uid || !hook?.id) return;
    setIsTesting(true);
    try {
      const result = await sendTestWebhook(user.uid, hook.id);
      if (result.success) {
        toast({ title: "Đã gửi Test!", description: "Vui lòng kiểm tra Lịch sử Webhook để xem kết quả." });
      } else {
        toast({ variant: "destructive", title: "Gửi thất bại", description: result.error });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể thực hiện yêu cầu." });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto w-8 h-8 text-accent" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-primary">Quản lý Webhooks</h2>
          <p className="text-muted-foreground">Cấu hình các điểm nhận dữ liệu (Endpoint) từ hệ thống AI.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="h-12 font-bold border-primary text-primary hover:bg-primary/5">
            <Link href="/huong-dan" target="_blank">
              <BookOpen className="w-5 h-5 mr-2" /> Xem Hướng dẫn
            </Link>
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90 font-bold h-12">
                <Plus className="w-5 h-5 mr-2" /> Thêm Endpoint
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm Endpoint Webhook mới</DialogTitle>
                <DialogDescription>Hệ thống sẽ gửi dữ liệu giao dịch đến URL này.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên gợi nhớ</Label>
                  <Input id="name" value={newWebhookData.name} onChange={(e) => setNewWebhookData({...newWebhookData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">URL Endpoint</Label>
                  <Input id="url" placeholder="https://your-website.com/api/webhook" value={newWebhookData.url} onChange={(e) => setNewWebhookData({...newWebhookData, url: e.target.value})} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Hủy</Button>
                <Button onClick={handleAddWebhook}>Lưu Endpoint</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Alert className="bg-primary/5 border-primary/20">
        <Terminal className="h-5 w-5 text-primary" />
        <AlertTitle className="text-primary font-bold text-lg">Cơ chế phát hiện mã tham chiếu</AlertTitle>
        <AlertDescription className="text-base mt-2">
          Hệ thống sẽ dựa vào <b>Tiền tố (Prefix)</b> bạn đã cài đặt trong phần Cài đặt (mặc định là <b>{hook?.referencePrefix || 'TT'}</b>) để trích xuất mã đơn hàng từ email ngân hàng và gửi về Endpoint dưới đây.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-8">
        {hook ? (
          <Card className="border-none shadow-lg overflow-hidden transition-all hover:shadow-xl">
            <div className="h-2 bg-gradient-to-r from-primary to-accent" />
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-xl font-bold">{hook.name}</CardTitle>
                  <Badge className={hook.isEnabled ? "bg-green-500 hover:bg-green-600" : "bg-slate-400"}>
                    {hook.isEnabled ? "Đang hoạt động" : "Tạm dừng"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm bg-muted/50 p-2 rounded-md border max-w-md">
                  <ExternalLink className="w-4 h-4 shrink-0" /> 
                  <span className="truncate">{hook.targetUrl}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => copyToClipboard(hook.targetUrl)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="font-bold border-accent text-accent">
                  Prefix: {hook.referencePrefix}
                </Badge>
                <Switch checked={hook.isEnabled} />
              </div>
              </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-bold text-primary flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Payload & Security
                  </h4>
                  <p className="text-sm text-muted-foreground">Mọi yêu cầu đều được gửi qua HTTPS POST với định dạng JSON, đi kèm Secret Key để bảo mật.</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-accent/5 text-accent border-accent/20 font-bold px-3 py-1">
                      New Bank Transfer
                    </Badge>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-inner">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Dữ liệu JSON mẫu (Prefix: {hook.referencePrefix})</p>
                    <Badge variant="outline" className="text-xs text-slate-400 border-slate-700">POST</Badge>
                  </div>
                  <pre className="text-xs font-mono text-green-400 overflow-x-auto leading-relaxed">
{`{
  "amount": 10000,
  "referenceCode": "${hook.referencePrefix}007",
  "senderName": "PAYMAILHOOK TEST",
  "secretKey": "${hook.secretToken?.substring(0, 10)}..."
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t flex flex-wrap justify-between items-center gap-4 px-8 py-6">
              <div className="flex items-center gap-6">
                <Button variant="ghost" size="sm" className="font-bold text-primary hover:bg-primary/5" onClick={handleSendTest} disabled={isTesting}>
                  {isTesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Gửi thử (Test)
                </Button>
                <Button asChild variant="ghost" size="sm" className="font-bold text-primary hover:bg-primary/5">
                  <Link href="/dashboard/history">
                    <Info className="w-4 h-4 mr-2" /> Lịch sử Webhook
                  </Link>
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 font-bold">
                <Trash2 className="w-4 h-4 mr-2" /> Xóa
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed">
            <p className="text-muted-foreground">Chưa có Endpoint nào được cấu hình.</p>
            <Button asChild className="mt-4 bg-accent">
              <Link href="/dashboard/settings">Thiết lập ngay</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}