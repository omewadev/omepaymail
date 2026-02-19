
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function UserManagementPage() {
  const users = [
    { id: "USR-001", name: "Nguyễn Văn A", plan: "Pro", limit: 1000, used: 950, joined: "12/10/2024" },
    { id: "USR-002", name: "Lê Văn B", plan: "Free", limit: 100, used: 20, joined: "15/11/2024" },
    { id: "USR-003", name: "Trần Thị C", plan: "Enterprise", limit: 10000, used: 4500, joined: "01/01/2024" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Quản lý Khách hàng</h2>
        <Button className="bg-accent"><UserPlus className="mr-2 h-4 w-4" /> Thêm User thủ công</Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-10" placeholder="Tìm theo tên hoặc email..." />
          </div>
          <Button variant="outline"><SlidersHorizontal className="mr-2 h-4 w-4" /> Bộ lọc</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Gói</TableHead>
                <TableHead>Đã dùng</TableHead>
                <TableHead>Hạn mức</TableHead>
                <TableHead>Ngày tham gia</TableHead>
                <TableHead className="text-right">Tác vụ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-mono text-[10px]">{u.id}</TableCell>
                  <TableCell className="font-bold">{u.name}</TableCell>
                  <TableCell><Badge variant="outline">{u.plan}</Badge></TableCell>
                  <TableCell className={u.used / u.limit > 0.9 ? "text-red-500 font-bold" : ""}>
                    {u.used.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">{u.limit.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{u.joined}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-accent">Sửa hạn mức</Button>
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
