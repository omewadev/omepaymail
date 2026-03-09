
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Zap, Shield, Crown } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function BillingPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user?.uid]);

  const { data: profile } = useDoc(userProfileRef);

  const plans = [
    {
      name: "Free",
      price: "0đ",
      limit: "100 giao dịch/tháng",
      features: ["1 Website WordPress", "Gmail Hook cơ bản", "Hỗ trợ cộng đồng"],
      icon: Zap,
      color: "bg-slate-100 text-slate-600"
    },
    {
      name: "Pro",
      price: "199.000đ",
      limit: "1.000 giao dịch/tháng",
      features: ["3 Website WordPress", "AI trích xuất nâng cao", "Ưu tiên xử lý", "Hỗ trợ 24/7"],
      icon: Shield,
      color: "bg-accent/10 text-accent",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Liên hệ",
      limit: "Không giới hạn",
      features: ["Website không giới hạn", "API riêng biệt", "Tư vấn tích hợp", "SLA 99.9%"],
      icon: Crown,
      color: "bg-amber-100 text-amber-600"
    }
  ];

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
                onClick={() => toast({ title: "Tính năng đang phát triển", description: "Vui lòng liên hệ Admin để nâng cấp gói cước." })}
                className={`w-full font-bold h-12 ${plan.name === profile?.planName ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}
                disabled={plan.name === profile?.planName}
              >
                {plan.name === profile?.planName ? "Đang sử dụng" : "Nâng cấp ngay"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
