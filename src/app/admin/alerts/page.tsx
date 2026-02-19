
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BellRing, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { generateNotification, type NotificationOutput } from "@/ai/flows/notification-flow";

export default function AdminAlertsPage() {
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [preview, setPreview] = useState<{ open: boolean; data: NotificationOutput | null }>({ open: false, data: null });
  
  const alerts = [
    { id: 1, user: "Nguyễn Văn A", email: "a@gmail.com", usage: 950, limit: 1000, plan: "Pro" },
    { id: 2, user: "Shop Quần Áo XYZ", email: "xyz@shop.vn", usage: 85, limit: 100, plan: "Free" },
    { id: 3, user: "Trần Thị B", email: "b@yahoo.com", usage: 890, limit: 1000, plan: "Pro" },
  ];

  const handleGenerateAlert = async (alert: any) => {
    setLoadingId(alert.id);
    try {
      const result = await generateNotification({
        userName: alert.user,
        used: alert.usage,
        limit: alert.limit,
        planName: alert.plan,
        paymentLink: "https://paymailhook.com/dashboard/billing"
      });
      setPreview({ open: true, data: result });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi AI",
        description: "Không thể soạn thảo email lúc này."
      });
    } finally {
      setLoadingId(null);
    }
  };

  const confirmSend = () => {
    setPreview({ open: false, data: null });
    toast({
      title: "Đã gửi thành công!",
      description: "Email cảnh báo đã được gửi tới hộp thư của khách hàng.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BellRing className="w-6 h-6 text-amber-500" />
            Cảnh báo hạn mức
          </h2>
          <p className="text-muted-foreground">Theo dõi và nhắc nhở khách hàng sắp dùng hết gói.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Danh sách cần xử lý</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Mức sử dụng</TableHead>
                <TableHead>Gói cước</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>
                    <div className="font-bold">{alert.user}</div>
                    <div className="text-[10px] text-muted-foreground">{alert.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-amber-600 font-bold">{alert.usage}/{alert.limit}</span>
                      <Badge variant="outline" className="text-[10px] bg-amber-50">
                        {Math.round((alert.usage / alert.limit) * 100)}%
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell><Badge>{alert.plan}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-accent border-accent hover:bg-accent hover:text-white"
                      onClick={() => handleGenerateAlert(alert)}
                      disabled={loadingId === alert.id}
                    >
                      {loadingId === alert.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3 mr-1" />}
                      Soạn báo phí
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={preview.open} onOpenChange={(o) => setPreview({ ...preview, open: o })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Xem trước Email (AI soạn thảo)</DialogTitle>
            <DialogDescription>Đây là nội dung sẽ được gửi tới khách hàng.</DialogDescription>
          </DialogHeader>
          {preview.data && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-slate-50 rounded border text-sm">
                <strong>Chủ đề:</strong> {preview.data.subject}
              </div>
              <div className="p-4 bg-slate-50 rounded border text-sm whitespace-pre-wrap leading-relaxed min-h-[200px]">
                {preview.data.body}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPreview({ open: false, data: null })}>Hủy bỏ</Button>
            <Button className="bg-accent" onClick={confirmSend}>Xác nhận & Gửi ngay</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
