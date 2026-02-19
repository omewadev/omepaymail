
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Send, BellRing, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function AdminAlertsPage() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState([
    { id: 1, user: "Nguyễn Văn A", usage: 950, limit: 1000, plan: "Pro", lastNotified: "2 giờ trước" },
    { id: 2, user: "Shop Quần Áo XYZ", usage: 85, limit: 100, plan: "Free", lastNotified: "Chưa thông báo" },
    { id: 3, user: "Trần Thị B", usage: 890, limit: 1000, plan: "Pro", lastNotified: "1 ngày trước" },
  ]);

  const handleSendAlert = (userName: string) => {
    toast({
      title: "Đã gửi thông báo!",
      description: `Hệ thống đã gửi email cảnh báo và link thanh toán cho ${userName}.`,
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
          <p className="text-muted-foreground">Danh sách người dùng đã sử dụng trên 80% hạn mức tháng.</p>
        </div>
        <Button variant="outline" className="border-amber-500 text-amber-600">
          <Send className="w-4 h-4 mr-2" /> Thông báo tất cả (Bulk)
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Khách hàng cần chú ý</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Mức sử dụng</TableHead>
                  <TableHead>Gói cước</TableHead>
                  <TableHead>Thông báo cuối</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-bold">{alert.user}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-amber-600 font-bold">{alert.usage}/{alert.limit}</span>
                        <Badge variant="outline" className="text-[10px] bg-amber-50">
                          {Math.round((alert.usage / alert.limit) * 100)}%
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell><Badge>{alert.plan}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{alert.lastNotified}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-accent font-bold"
                        onClick={() => handleSendAlert(alert.user)}
                      >
                        <Send className="w-3 h-3 mr-1" /> Nhắc thanh toán
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
