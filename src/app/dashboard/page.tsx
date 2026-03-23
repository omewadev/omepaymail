
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight, Mail, Cpu, Globe, Zap, CheckCircle2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import Link from "next/link";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, limit, orderBy } from "firebase/firestore";
import { useMemo } from "react";

export default function OverviewPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user?.uid]);

  const { data: profile, isLoading: profileLoading } = useDoc(userProfileRef);

  const webhooksQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, "users", user.uid, "webhookConfigurations"), limit(1));
  }, [firestore, user?.uid]);

  const { data: webhooks } = useCollection(webhooksQuery);
  const prefix = webhooks?.[0]?.referencePrefix || "TT";

  // Lấy lịch sử giao dịch thực tế từ Database
  const logsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, "users", user.uid, "webhook_logs"), orderBy("createdAt", "desc"), limit(100));
  }, [firestore, user?.uid]);
  const { data: logs } = useCollection(logsQuery);

  // Xử lý dữ liệu thực tế cho biểu đồ (Gom nhóm theo thứ trong tuần)
  const chartData = useMemo(() => {
    const baseData =[
      { name: 'CN', total: 0 }, { name: 'T2', total: 0 }, { name: 'T3', total: 0 },
      { name: 'T4', total: 0 }, { name: 'T5', total: 0 }, { name: 'T6', total: 0 }, { name: 'T7', total: 0 }
    ];

    if (logs) {
      logs.forEach(log => {
        if (log.createdAt) {
          const date = new Date(log.createdAt);
          const dayIndex = date.getDay(); // 0 = CN, 1 = T2...
          baseData[dayIndex].total += 1; // Tăng số lượng giao dịch cho ngày đó
        }
      });
    }

    // Sắp xếp lại mảng để T2 đứng đầu, CN đứng cuối cho thuận mắt người Việt
    return [baseData[1], baseData[2], baseData[3], baseData[4], baseData[5], baseData[6], baseData[0]];
  }, [logs]);

  const usageCount = profile?.transactionCount || 0;
  const limitCount = profile?.transactionLimit || 100;
  const usagePercent = Math.round((usageCount / limitCount) * 100);
  const isWarning = usagePercent >= 80;

  if (profileLoading) return <div className="p-8">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Cảnh báo hạn mức */}
      {isWarning && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-amber-800">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-lg">Cảnh báo: Sắp hết hạn mức giao dịch!</p>
              <p className="text-sm opacity-80">Bạn đã sử dụng {usagePercent}% gói cước. Hãy nâng cấp để tránh gián đoạn xác nhận đơn hàng của bạn.</p>
            </div>
          </div>
          <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg">
            <Link href="/dashboard/billing" className="flex items-center gap-2 font-bold">
              Gia hạn & Nâng cấp ngay <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      )}

      {/* Sơ đồ luồng hoạt động */}
      <Card className="border-none shadow-sm bg-slate-50 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            Quy trình tự động hóa động
          </CardTitle>
          <CardDescription>Hệ thống đang tìm kiếm mã bắt đầu bằng: <Badge variant="outline" className="text-accent border-accent ml-1">{prefix}</Badge></CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
            {/* Bước 1: Ngân hàng */}
            <div className="md:col-span-1 flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-200">
                <Globe className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-[10px] font-bold uppercase text-slate-500">Ngân hàng</span>
            </div>

            <div className="hidden md:flex md:col-span-1 justify-center">
              <ArrowRight className="text-slate-300" />
            </div>

            {/* Bước 2: Gmail Hook */}
            <div className="md:col-span-1 flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-200">
                <Mail className="w-6 h-6 text-red-500" />
              </div>
              <span className="text-[10px] font-bold uppercase text-slate-500">Gmail Hook</span>
            </div>

            <div className="hidden md:flex md:col-span-1 justify-center">
              <ArrowRight className="text-slate-300" />
            </div>

            {/* Bước 3: AI Extract */}
            <div className="md:col-span-1 flex flex-col items-center text-center space-y-2 relative">
            <div className="w-16 h-16 rounded-2xl bg-accent text-white shadow-lg flex items-center justify-center animate-pulse">
                <Cpu className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold uppercase text-accent">AI ({prefix}xxxxxx)</span>
              <Badge className="absolute -top-2 -right-2 bg-green-500 text-xs">Real-time</Badge>
            </div>

            <div className="hidden md:flex md:col-span-1 justify-center">
              <ArrowRight className="text-slate-300" />
            </div>

            {/* Bước 4: Website Merchant */}
            <div className="md:col-span-1 flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-green-200">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-[10px] font-bold uppercase text-slate-500">Website Bạn</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chỉ số chính */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-md bg-primary text-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-white/70 text-xs">Gói cước hiện tại</CardDescription>
            <CardTitle className="text-2xl font-bold uppercase">{profile?.planName || "Free"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-white/50">Hạn mức tối đa: {limitCount.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Giao dịch / Hạn mức</CardDescription>
            <CardTitle className="text-2xl font-bold">{usageCount.toLocaleString()} / {limitCount.toLocaleString()}</CardTitle>
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
                <BarChart data={chartData}>
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
            <CardTitle className="text-lg">Thông tin tài khoản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-secondary/30 space-y-3 border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Email đăng ký:</span>
                <span className="text-xs font-mono">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">UID hệ thống:</span>
                <span className="text-xs font-mono text-muted-foreground">{user?.uid?.substring(0, 8)}...</span>
              </div>
            </div>
            <Button asChild className="w-full bg-accent hover:bg-accent/90 shadow-md">
              <Link href="/dashboard/billing">Nâng cấp tài khoản ngay</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
