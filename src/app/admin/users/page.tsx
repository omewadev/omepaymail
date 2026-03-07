
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { collection, doc } from "firebase/firestore";

export default function UserManagementPage() {
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "users");
  }, [firestore]);

  const { data: users, isLoading } = useCollection(usersQuery);

  const handleUpdateLimit = (userId: string, currentLimit: number) => {
    if (!firestore) return;
    const newLimit = currentLimit + 500;
    const docRef = doc(firestore, "users", userId);
    updateDocumentNonBlocking(docRef, { transactionLimit: newLimit });
  };

  if (isLoading) return <div className="p-8">Đang tải danh sách khách hàng...</div>;

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
                <TableHead>Email</TableHead>
                <TableHead>Gói</TableHead>
                <TableHead>Đã dùng</TableHead>
                <TableHead>Hạn mức</TableHead>
                <TableHead className="text-right">Tác vụ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-bold">{u.email}</TableCell>
                  <TableCell><Badge variant="outline">{u.planName}</Badge></TableCell>
                  <TableCell className={u.transactionCount / u.transactionLimit > 0.9 ? "text-red-500 font-bold" : ""}>
                    {u.transactionCount?.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">{u.transactionLimit?.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-accent"
                      onClick={() => handleUpdateLimit(u.id, u.transactionLimit)}
                    >
                      +500 Hạn mức
                    </Button>
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
