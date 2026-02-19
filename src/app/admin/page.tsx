
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, CreditCard, Activity, ArrowUpRight } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { label: "Tổng người dùng", value: "1,250", icon: Users, color: "text-blue-600" },
    { label: "Giao dịch/tháng", value: "45,000", icon: Activity, color: "text-green-600" },
    { label: "Doanh thu ước tính", value: "125M VNĐ", icon: CreditCard, color: "text-accent" },
  ];

  const topUsers = [
    { name: "Nguyễn Văn A", email: "a@gmail.com", usage: "950/1000", status: "Cảnh báo" },
    { name: "Shop Quần Áo XYZ", email: "xyz@shop.vn", usage: "450/1000", status: "Bình thường" },
    { name: "Đại lý Vé Máy Bay", email: "vemaybay@mail.com", usage: "2500/3000", status: "Bình thường" },
    { name: "Trần Thị B", email: "b@yahoo.com", usage: "99/100", status: "Sắp hết hạn" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, idx) => (
          <Card key={idx} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
              <p className="text-[10px] text-green-500 flex items-center mt-1">
                <ArrowUpRight className="w-3 h-3 mr-1" /> +12% so với tháng trước
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Khách hàng sử dụng nhiều nhất</CardTitle>
          <CardDescription>Danh sách người dùng sắp chạm hạn mức giao dịch.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mức sử dụng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topUsers.map((u, i) => (
                <TableRow key={i}>
                  <TableCell className="font-bold">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{u.email}</TableCell>
                  <TableCell>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 max-w-[100px] mb-1">
                      <div 
                        className={`h-1.5 rounded-full ${u.status === 'Cảnh báo' ? 'bg-red-500' : 'bg-primary'}`} 
                        style={{ width: '85%' }} 
                      />
                    </div>
                    <span className="text-[10px] font-mono">{u.usage}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.status === 'Bình thường' ? 'default' : 'destructive'} className="text-[10px]">
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <button className="text-xs font-bold text-accent hover:underline">Nhắc nhở nạp tiền</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
