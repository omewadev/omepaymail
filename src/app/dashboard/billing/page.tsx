"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Zap, Shield, Crown, QrCode, Loader2 } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";

// CẤU HÌNH TÀI KHOẢN NGÂN HÀNG CỦA ADMIN (Sếp thay đổi thông tin này)
const ADMIN_BANK = {
  BANK_ID: "MB", // Mã ngân hàng (VD: MB, VCB, TCB, VTB...)
  ACCOUNT_NO: "0123456789", // Số tài khoản của sếp
  ACCOUNT_NAME: "NGUYEN VAN ADMIN", // Tên chủ tài khoản (Không dấu)
};

export default function BillingPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  // State quản lý Modal thanh toán
  const[isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user?.uid]);

  const { data: profile } = useDoc(userProfileRef);

  const plans =[
    {
      name: "Free",
      price: "0đ",
      priceNumber: 0,
      limit: "100 giao dịch/tháng",
      features:["1 Website WordPress", "Gmail Hook cơ bản", "Hỗ trợ cộng đồng"],
      icon: Zap,
      color: "bg-slate-100 text-slate-600"
    },
    {
      name: "Pro",
      price: "199.000đ",
      priceNumber: 199000,
      limit: "1.000 giao dịch/tháng",
      features:["3 Website WordPress", "AI trích xuất nâng cao", "Ưu tiên xử lý", "Hỗ trợ 24/7"],
      icon: Shield,
      color: "bg-accent/10 text-accent",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Liên hệ",
      priceNumber: 0,
      limit: "Không giới hạn",
      features:["Website không giới hạn", "API riêng biệt", "Tư vấn tích hợp", "SLA 99.9%"],
      icon: Crown,
      color: "bg-amber-100 text-amber-600"
    }
  ];

  const handleUpgradeClick = (plan: any) => {
    if (plan.name === "Enterprise") {
      window.location.href = "mailto:admin@omepaymail.vn?subject=Đăng ký gói Enterprise";
      return;
    }
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  // Tạo cú pháp chuyển khoản duy nhất: PMH [TÊN_GÓI][8_KÝ_TỰ_ĐẦU_CỦA_UID]
  const transferSyntax = user?.uid ? `PMH ${selectedPlan?.name.toUpperCase()} ${user.uid.substring(0, 8).toUpperCase()}` : "";
  
  // Tạo link ảnh VietQR động
  const vietQrUrl = selectedPlan ? `https://img.vietqr.io/image/${ADMIN_BANK.BANK_ID}-${ADMIN_BANK.ACCOUNT_NO}-compact2.png?amount=${selectedPlan.priceNumber}&addInfo=${encodeURIComponent(transferSyntax)}&accountName=${encodeURIComponent(ADMIN_BANK.ACCOUNT_NAME)}` : "";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-headline font-bold text-primary">Gói cước dịch vụ</h2>
        <p className="text-muted-foreground">Chọn gói cước phù hợp với quy mô kinh doanh của bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative border-none shadow-lg overflow-hidden flex flex-col ${plan.popular ? 'ring-2 ring-accent' : ''}`}>
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-accent text-white px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-bl-lg">
                Phổ biến nhất
              </div>
            )}
            <CardHeader className="space-y-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${plan.color}`}>
                <plan.icon className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-xl font-bold text-primary mt-1">{plan.price}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
              <div className="py-3 border-y border-slate-50">
                <p className="text-sm font-bold text-slate-700">{plan.limit}</p>
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleUpgradeClick(plan)}
                className={`w-full font-bold h-12 ${plan.name === profile?.planName ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}
                disabled={plan.name === profile?.planName}
              >
                {plan.name === profile?.planName ? "Đang sử dụng" : "Nâng cấp ngay"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Modal Thanh toán bằng VietQR */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl text-primary">Thanh toán gói {selectedPlan?.name}</DialogTitle>
            <DialogDescription className="text-center">
              Quét mã QR bằng ứng dụng ngân hàng để thanh toán tự động.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            {vietQrUrl ? (
              <div className="p-2 bg-white rounded-xl border-2 border-dashed border-accent/50">
                {/* Sử dụng thẻ img thường thay vì next/image để tránh lỗi config domain remotePatterns */}
                <img 
                  src={vietQrUrl} 
                  alt="VietQR" 
                  className="w-64 h-64 object-contain"
                />
              </div>
            ) : (
              <div className="w-64 h-64 flex items-center justify-center bg-slate-100 rounded-xl">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            )}

            <div className="w-full bg-slate-50 p-4 rounded-lg border space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số tiền:</span>
                <span className="font-bold text-primary">{selectedPlan?.price}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Nội dung CK:</span>
                <span className="font-mono font-bold text-accent bg-accent/10 px-2 py-1 rounded">{transferSyntax}</span>
              </div>
            </div>
            
            <p className="text-xs text-center text-muted-foreground mt-2">
              Hệ thống sẽ tự động nâng cấp tài khoản của bạn trong vòng 1-2 phút sau khi nhận được thanh toán. Bạn không cần làm gì thêm!
            </p>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="w-full">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}