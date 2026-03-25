"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, UserPlus, Copy, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function UserManagementPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [limitInputs, setLimitInputs] = useState<{ [key: string]: string }>({});
  const [logLimitInputs, setLogLimitInputs] = useState<{ [key: string]: string }>({});

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "users");
  }, [firestore]);

  const { data: users, isLoading } = useCollection(usersQuery);

  useEffect(() => {
    if (users) {
      const initialEmailLimits = users.reduce((acc, user) => {
        acc[user.id] = String(user.emailStorageLimit || 100);
        return acc;
      }, {} as { [key: string]: string });
      setLimitInputs(initialEmailLimits);

      const initialLogLimits = users.reduce((acc, user) => {
        acc[user.id] = String(user.webhookLogLimit || 100);
        return acc;
      }, {} as { [key: string]: string });
      setLogLimitInputs(initialLogLimits);
    }
  }, [users]);

  const handleTxLimitUpdate = (userId: string, currentLimit: number, amount: number) => {
    if (!firestore) return;
    const newLimit = Math.max(0, currentLimit + amount);
    const docRef = doc(firestore, "users", userId);
    updateDocumentNonBlocking(docRef, { transactionLimit: newLimit });
  };

  const handleEmailLimitChange = (userId: string, value: string) => {
    setLimitInputs(prev => ({ ...prev, [userId]: value }));
  };

  const handleEmailLimitSave = (userId: string) => {
    if (!firestore) return;
    const newLimit = parseInt(limitInputs[userId], 10);
    if (isNaN(newLimit) || newLimit < 0) {
      toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng nhập một số hợp lệ." });
      return;
    }
    const docRef = doc(firestore, "users", userId);
    updateDocumentNonBlocking(docRef, { emailStorageLimit: newLimit });
    toast({ title: "Thành công", description: `Đã cập nhật giới hạn mail cho user.` });
  };

  const handleLogLimitChange = (userId: string, value: string) => {
    setLogLimitInputs(prev => ({ ...prev, [userId]: value }));
  };

  const handleLogLimitSave = (userId: string) => {
    if (!firestore) return;
    const newLimit = parseInt(logLimitInputs[userId], 10);
    if (isNaN(newLimit) || newLimit < 0) {
      toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng nhập một số hợp lệ." });
      return;
    }
    const docRef = doc(firestore, "users", userId);
    updateDocumentNonBlocking(docRef, { webhookLogLimit: newLimit });
    toast({ title: "Thành công", description: `Đã cập nhật giới hạn log cho user.` });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: `UID: ${text}`,
    });
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
                <TableHead>UID (8 ký tự)</TableHead>
                <TableHead>Gói</TableHead>
                <TableHead>Đã dùng</TableHead>
                <TableHead>Hạn mức</TableHead>
                <TableHead>Giới hạn Mail</TableHead>
                <TableHead>Giới hạn Log</TableHead>
                <TableHead className="text-right">Tác vụ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-bold">{u.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">
                        {u.id.substring(0, 8).toUpperCase()}
                      </code>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 text-slate-400 hover:text-accent" 
                        onClick={() => copyToClipboard(u.id.substring(0, 8).toUpperCase())}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{u.planName}</Badge></TableCell>
                  <TableCell className={u.transactionCount / u.transactionLimit > 0.9 ? "text-red-500 font-bold" : ""}>
                    {u.transactionCount?.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">{u.transactionLimit?.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        className="h-8 w-20"
                        value={limitInputs[u.id] || ''}
                        onChange={(e) => handleEmailLimitChange(u.id, e.target.value)}
                      />
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEmailLimitSave(u.id)}>
                        <Save className="w-4 h-4 text-accent" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        className="h-8 w-20"
                        value={logLimitInputs[u.id] || ''}
                        onChange={(e) => handleLogLimitChange(u.id, e.target.value)}
                      />
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleLogLimitSave(u.id)}>
                        <Save className="w-4 h-4 text-accent" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive border-destructive hover:bg-destructive hover:text-white"
                        onClick={() => handleTxLimitUpdate(u.id, u.transactionLimit, -500)}
                      >
                        -500
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-accent border-accent hover:bg-accent hover:text-white"
                        onClick={() => handleTxLimitUpdate(u.id, u.transactionLimit, 500)}
                      >
                        +500
                      </Button>
                    </div>
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