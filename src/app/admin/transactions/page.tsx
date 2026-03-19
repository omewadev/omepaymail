"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { History, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collectionGroup, query, orderBy, limit } from "firebase/firestore";
import { format } from "date-fns";

export default function AdminTransactionsPage() {
  const firestore = useFirestore();

  // Sử dụng Collection Group query để lấy toàn bộ webhook_logs của TẤT CẢ users
  const logsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collectionGroup(firestore, "webhook_logs"),
      orderBy("createdAt", "desc"),
      limit(100)
    );
  }, [firestore]);

  const { data: logs, isLoading, error } = useCollection(logsQuery);

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto w-8 h-8 text-accent" /></div>;

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p className="font-bold">Lỗi truy vấn dữ liệu!</p>
        <p className="text-sm">Vui lòng kiểm tra lại Index của Firestore (Collection Group).</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Lịch sử Giao dịch Toàn hệ thống</h2>
        <p className="text-muted-foreground">Giám sát luồng tiền và trạng thái Webhook của tất cả khách hàng.</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-accent" />
            100 Giao dịch gần nhất
          </CardTitle>
          <CardDescription>Dữ liệu tổng hợp từ tất cả các tài khoản (Real-time).</CardDescription>
        </CardHeader>
        <CardContent>
          {logs && logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Mã tham chiếu</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Người gửi</TableHead>
                  <TableHead>Trạng thái Webhook</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.createdAt ? format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss") : "N/A"}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-primary">{log.referenceCode || "N/A"}</TableCell>
                    <TableCell className="font-bold text-green-600">
                      +{log.amount?.toLocaleString()} {log.currency}
                    </TableCell>
                    <TableCell className="text-xs">{log.senderName || "Ẩn danh"}</TableCell>
                    <TableCell>
                      {log.isSuccess ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 flex w-fit items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Thành công ({log.statusCode})
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex w-fit items-center gap-1">
                          <XCircle className="w-3 h-3" /> Lỗi ({log.statusCode})
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
              Chưa có giao dịch nào được ghi nhận trên hệ thống.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}