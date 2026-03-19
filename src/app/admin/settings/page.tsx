"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save, Building, Loader2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";

export default function AdminSettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, "system_settings", "general");
  }, [firestore]);

  const { data: settings, isLoading } = useDoc(settingsRef);
  
  const [formData, setFormData] = useState({
    bankId: "",
    accountNo: "",
    accountName: "",
    adminInboundEmail: ""
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        bankId: settings.bankId || "",
        accountNo: settings.accountNo || "",
        accountName: settings.accountName || "",
        adminInboundEmail: settings.adminInboundEmail || ""
      });
    }
  }, [settings]);

  const handleSave = () => {
    if (!firestore) return;
    const ref = doc(firestore, "system_settings", "general");
    setDocumentNonBlocking(ref, {
      ...formData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    toast({
      title: "Thành công",
      description: "Đã lưu cấu hình hệ thống.",
    });
  };

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto w-8 h-8 text-accent" /></div>;

  return (
    <div className="space-y-6 max-w-3xl animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Cài đặt Hệ thống</h2>
        <p className="text-muted-foreground">Cấu hình thông tin thanh toán và luồng nhận email của Admin.</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-accent" />
            Thông tin Ngân hàng (Nhận tiền nâng cấp)
          </CardTitle>
          <CardDescription>Thông tin này sẽ hiển thị mã QR ở trang Thanh toán của khách hàng.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mã Ngân hàng (VD: MB, VCB, TCB)</Label>
              <Input value={formData.bankId} onChange={e => setFormData({...formData, bankId: e.target.value})} placeholder="MB" />
            </div>
            <div className="space-y-2">
              <Label>Số tài khoản</Label>
              <Input value={formData.accountNo} onChange={e => setFormData({...formData, accountNo: e.target.value})} placeholder="0123456789" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tên chủ tài khoản (Không dấu)</Label>
            <Input value={formData.accountName} onChange={e => setFormData({...formData, accountName: e.target.value})} placeholder="NGUYEN VAN A" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-accent" />
            Email Inbound của Admin
          </CardTitle>
          <CardDescription>Địa chỉ email ảo của Admin dùng để nhận biến động số dư nâng cấp gói.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Email Forwarding (Admin)</Label>
            <Input value={formData.adminInboundEmail} onChange={e => setFormData({...formData, adminInboundEmail: e.target.value})} placeholder="inbound+admin@omepaymail.vn" />
            <p className="text-xs text-muted-foreground mt-2">
              Khi email ngân hàng gửi vào địa chỉ này có chứa cú pháp <b>PMH PRO [UID]</b>, hệ thống sẽ tự động nâng cấp cho user đó.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} className="bg-accent hover:bg-accent/90 ml-auto">
            <Save className="w-4 h-4 mr-2" /> Lưu thay đổi
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}