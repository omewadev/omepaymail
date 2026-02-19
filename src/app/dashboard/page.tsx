
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import Link from "next/link";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

const data = [
  { name: 'T2', total: 400 },
  { name: 'T3', total: 300 },
  { name: 'T4', total: 200 },
  { name: 'T5', total: 278 },
  { name: 'T6', total: 189 },
  { name: 'T7', total: 239 },
  { name: 'CN', total: 349 },
];

export default function OverviewPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user?.uid]);

  const { data: profile, isLoading } = useDoc(userProfileRef);

  const usageCount = profile?.transactionCount || 0;
  const limit = profile?.transactionLimit || 100;
  const usagePercent = Math.round((usageCount / limit) * 100);
  const isWarning = usagePercent >= 80;

  if (isLoading) return <div className="p-8">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {isWarning && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-amber-800">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-lg">Cảnh báo: Sắp hết hạn mức giao dịch!</p>
              <p className="text-sm opacity-80">Bạn đã sử dụng {usagePercent}% gói cước. Hãy nâng cấp để tránh gián đoạn xác nhận đơn hàng WordPress.</p>
            </div>
          </div>
          <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg">
            <Link href="/dashboard/settings" className="flex items-center gap-2 font-bold">
              Gia hạn & Nâng cấp ngay <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-md bg-primary text-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-white/70 text-xs">Gói cước</CardDescription>
            <CardTitle className="text-2xl font-bold uppercase">{profile?.planName || "Free"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-white/50">Hạn mức tối đa: {limit.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Giao dịch / Hạn mức</CardDescription>
            <CardTitle className="text-2xl font-bold">{usageCount.toLocaleString()} / {limit.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={usagePercent} className={`h-2 ${isWarning ? 'bg-amber-100' : 'bg-muted'}`} />
            <p className="text-[10px] text-muted-foreground text-right">{usagePercent}% đã dùng</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription className="text-xs">Gmail Hook Status</CardDescription>
              <CardTitle className="text-2xl font-bold">Hoạt động</CardTitle>
            </div>
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Tỉ lệ thành công</CardDescription>
            <CardTitle className="text-2xl font-bold">100%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        <Card className="lg:col-span-4 border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Giao dịch tuần này</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: 'rgba(111, 45, 189, 0.05)'}} />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Hành động nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-secondary/30 space-y-3 border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-xs font-mono">{user?.email}</span>
              </div>
            </div>
            <Button asChild className="w-full bg-accent hover:bg-accent/90">
              <Link href="/dashboard/settings">Nâng cấp tài khoản</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
