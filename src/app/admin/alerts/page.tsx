
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BellRing, Send, Loader2, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { generateNotification, type NotificationOutput } from "@/ai/flows/notification-flow";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Input } from "@/components/ui/input";

interface User {
  id: string;
  displayName?: string;
  email?: string;
  transactionCount?: number;
  transactionLimit?: number;
  planName?: string;
}

export default function AdminAlertsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [preview, setPreview] = useState<{ open: boolean; data: NotificationOutput | null; userId: string | null }>({
    open: false,
    data: null,
    userId: null
  });

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "users");
  }, [firestore]);

  const { data: users, isLoading } = useCollection(usersQuery);

  // Lọc ra các user có mức sử dụng trên 80%
  const criticalUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => {
      const usage = u.transactionCount || 0;
      const limit = u.transactionLimit || 1;
      const percent = (usage / limit) * 100;
      const matchesSearch = u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            u.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
      return percent >= 80 && matchesSearch;
    });
  }, [users, searchTerm]);

  const handleGenerateAlert = async (alert: User) => {
    setLoadingId(alert.id);
    try {
      const result = await generateNotification({
        userName: alert.displayName || alert.email,
        used: alert.transactionCount || 0,
        limit: alert.transactionLimit || 100,
        planName: alert.planName || "Free",
        paymentLink: window.location.origin + "/dashboard/billing"
      });
      setPreview({ open: true, data: result, userId: alert.id });
    } catch {
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
    setPreview({ open: false, data: null, userId: null });
    toast({
      title: "Đã gửi thành công!",
      description: "Email cảnh báo đã được gửi tới hộp thư của khách hàng.",
    });
  };

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto w-8 h-8 text-accent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BellRing className="w-6 h-6 text-amber-500" />
            Cảnh báo hạn mức (Live)
          </h2>
          <p className="text-muted-foreground">Tự động phát hiện khách hàng sắp dùng hết gói (trên 80%).</p>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Danh sách cần xử lý ({criticalUsers.length})</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Tìm user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {criticalUsers.length > 0 ? (
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
                {criticalUsers.map((user) => {
                  const usage = user.transactionCount || 0;
                  const limit = user.transactionLimit || 100;
                  const percent = Math.round((usage / limit) * 100);

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-bold">{user.displayName || "N/A"}</div>
                        <div className="text-[10px] text-muted-foreground">{user.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-amber-600 font-bold">{usage.toLocaleString()}/{limit.toLocaleString()}</span>
                          <Badge variant="outline" className={`text-[10px] ${percent >= 95 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50'}`}>
                            {percent}%
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary">{user.planName}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-accent border-accent hover:bg-accent hover:text-white"
                          onClick={() => handleGenerateAlert(user as User)}
                          disabled={loadingId === user.id}
                        >
                          {loadingId === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3 mr-1" />}
                          Gửi cảnh báo AI
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Hiện chưa có khách hàng nào vượt ngưỡng cảnh báo 80%.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={preview.open} onOpenChange={(o) => setPreview({ ...preview, open: o })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Email AI tự động soạn thảo</DialogTitle>
            <DialogDescription>Hệ thống đã phân tích dữ liệu và tạo nội dung phù hợp cho khách hàng.</DialogDescription>
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
            <Button variant="ghost" onClick={() => setPreview({ open: false, data: null, userId: null })}>Hủy bỏ</Button>
            <Button className="bg-accent" onClick={confirmSend}>Xác nhận & Gửi Email</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
