"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { History, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { format } from "date-fns";

export default function WebhookHistoryPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const logsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
      collection(firestore, "users", user.uid, "webhook_logs"),
      orderBy("createdAt", "desc"),
      limit(50)
    );
  },[firestore, user?.uid]);

  const { data: logs, isLoading, error: logsError } = useCollection(logsQuery);

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto w-8 h-8 text-accent" /></div>;

  if (logsError) {
    return (
      <div className="p-8 text-center space-y-4 bg-red-50 rounded-xl border border-red-200">
        <p className="text-red-600 font-bold text-lg">Đã xảy ra lỗi khi tải dữ liệu lịch sử.</p>
        <p className="text-sm text-red-500">{logsError.message}</p>
        <p className="text-xs text-slate-500">Mẹo: Mở Developer Tools (F12) chuyển sang tab Console. Nếu đây là lỗi thiếu Index, Firebase sẽ cung cấp một đường link màu xanh để bạn click vào và tạo Index tự động.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-headline font-bold text-primary">Lịch sử Webhook</h2>
        <p className="text-muted-foreground">Theo dõi trạng thái các giao dịch đã được AI xử lý và gửi về website của bạn.</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-accent" />
            50 Giao dịch gần nhất
          </CardTitle>
          <CardDescription>Dữ liệu được cập nhật theo thời gian thực (Real-time).</CardDescription>
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
                      {log.createdAt && !isNaN(new Date(log.createdAt).getTime()) 
                        ? format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss") 
                        : "N/A"}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-primary">{log.referenceCode || "N/A"}</TableCell>
                    <TableCell className="font-bold text-green-600">
                      +{Number(log.amount || 0).toLocaleString()} {log.currency}
                    </TableCell>
                    <TableCell className="text-xs">{log.senderName || "Ẩn danh"}</TableCell>
                    <TableCell>
                      {log.isSuccess ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 flex w-fit items-center gap-1 text-xs">
                          <CheckCircle2 className="w-3 h-3" /> Thành công ({log.statusCode})
                        </Badge>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <Badge variant="destructive" className="flex w-fit items-center gap-1 text-xs">
                            <XCircle className="w-3 h-3" /> Lỗi ({log.statusCode})
                          </Badge>
                          {log.responseBody && (
                            <span className="text-[10px] text-red-500 max-w-[200px] truncate" title={log.responseBody}>
                              {log.responseBody}
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
              Chưa có giao dịch nào được ghi nhận.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}