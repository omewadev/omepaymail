
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, CreditCard, Activity, ArrowUpRight, Loader2 } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { useMemo } from "react";

export default function AdminDashboard() {
  const firestore = useFirestore();
  // Lấy danh sách user từ Database, sắp xếp theo số lượng giao dịch giảm dần
  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "users"), orderBy("transactionCount", "desc"), limit(50));
  }, [firestore]);

  const { data: users, isLoading } = useCollection(usersQuery);

  // Tính toán thống kê thực tế
  const stats = useMemo(() => {
    const totalUsers = users?.length || 0;
    const totalTransactions = users?.reduce((sum, u) => sum + (u.transactionCount || 0), 0) || 0;
    const estimatedRevenue = users?.reduce((sum, u) => {
      if (u.planName === 'Pro') return sum + 199000;
      if (u.planName === 'Enterprise') return sum + 500000;
      return sum;
    }, 0) || 0;

    return[
      { label: "Tổng người dùng", value: totalUsers.toLocaleString(), icon: Users, color: "text-blue-600" },
      { label: "Giao dịch/tháng", value: totalTransactions.toLocaleString(), icon: Activity, color: "text-green-600" },
      { label: "Doanh thu ước tính", value: `${(estimatedRevenue / 1000000).toFixed(1)}M VNĐ`, icon: CreditCard, color: "text-accent" },
    ];
  }, [users]);

  // Lấy top 5 user dùng nhiều nhất
  const topUsers = useMemo(() => {
    if (!users) return[];
    return users.slice(0, 5).map(u => {
      const usage = u.transactionCount || 0;
      const maxLimit = u.transactionLimit || 100;
      const percent = maxLimit > 0 ? (usage / maxLimit) * 100 : 0;
      
      let status = "Bình thường";
      if (percent >= 90) status = "Sắp hết hạn";
      else if (percent >= 80) status = "Cảnh báo";

      return {
        name: u.displayName || "Chưa cập nhật",
        email: u.email,
        usage: `${usage.toLocaleString()}/${maxLimit.toLocaleString()}`,
        percent: Math.min(percent, 100),
        status: status
      };
    });
  }, [users]);

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto w-8 h-8 text-accent" /></div>;

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
                        className={`h-1.5 rounded-full ${u.status !== 'Bình thường' ? 'bg-red-500' : 'bg-primary'}`} 
                        style={{ width: `${u.percent}%` }} 
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
