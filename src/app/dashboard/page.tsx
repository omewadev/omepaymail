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

  //[LOGIC 3 LUỒNG UI]
  const currentMonth = new Date().toISOString().slice(0, 7);
  const isNewMonth = profile?.lastMonthlyReset !== currentMonth;
  
  // Nếu sang tháng mới mà chưa có giao dịch nào kích hoạt API, UI tự động hiển thị 50 ảo cho user yên tâm
  const txMonthly = isNewMonth ? 50 : (profile?.txMonthlyBalance ?? 0);
  const txWelcome = profile?.txWelcomeBalance ?? (profile?.transactionLimit ? Math.max(0, profile.transactionLimit - (profile.transactionCount || 0)) : 0);
  const txPurchased = profile?.txPurchasedBalance ?? 0;
  
  const totalRemaining = txMonthly + txWelcome + txPurchased;
  const isWarning = totalRemaining <= 10; // Cảnh báo khi tổng còn dưới 10 GD

  if (profileLoading) return <div className="p-8">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Cảnh báo hạn mức */}
      {isWarning && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-amber-800">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-xl">Cảnh báo: Sắp hết hạn mức giao dịch!</p>
              <p className="text-base opacity-90 mt-1">Bạn chỉ còn <b>{totalRemaining}</b> giao dịch. Hãy nâng cấp để tránh gián đoạn xác nhận đơn hàng của bạn.</p>
            </div>
          </div>
          <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg h-12 px-6">
            <Link href="/dashboard/billing" className="flex items-center gap-2 font-bold text-base">
              Gia hạn & Nâng cấp ngay <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      )}

      {/* Sơ đồ luồng hoạt động */}
      <Card className="border-none shadow-sm bg-slate-50 overflow-hidden">
        <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
            <Zap className="w-6 h-6 text-accent" />
            Quy trình tự động hóa
          </CardTitle>
          <CardDescription className="text-base mt-1">
            Hệ thống đang tìm kiếm mã bắt đầu bằng: <Badge variant="outline" className="text-accent border-accent ml-1 text-sm px-2 py-0.5">{prefix}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
            {/* Bước 1: Ngân hàng */}
            <div className="md:col-span-1 flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-200">
                <Globe className="w-8 h-8 text-blue-500" />
              </div>
              <span className="text-xs sm:text-sm font-bold uppercase text-slate-600">Ngân hàng</span>
            </div>

            <div className="hidden md:flex md:col-span-1 justify-center">
              <ArrowRight className="text-slate-400 w-6 h-6" />
            </div>

            {/* Bước 2: Gmail Hook */}
            <div className="md:col-span-1 flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-200">
                <Mail className="w-8 h-8 text-red-500" />
              </div>
              <span className="text-xs sm:text-sm font-bold uppercase text-slate-600">Gmail Hook</span>
            </div>

            <div className="hidden md:flex md:col-span-1 justify-center">
              <ArrowRight className="text-slate-400 w-6 h-6" />
            </div>

            {/* Bước 3: AI Extract */}
            <div className="md:col-span-1 flex flex-col items-center text-center space-y-3 relative">
              <div className="w-20 h-20 rounded-2xl bg-accent text-white shadow-lg flex items-center justify-center animate-pulse">
                <Cpu className="w-10 h-10" />
              </div>
              <span className="text-sm font-bold uppercase text-accent">AI ({prefix}xxxxxx)</span>
              <Badge className="absolute -top-3 -right-3 bg-green-500 text-xs px-2 py-0.5 shadow-sm">Real-time</Badge>
            </div>

            <div className="hidden md:flex md:col-span-1 justify-center">
              <ArrowRight className="text-slate-400 w-6 h-6" />
            </div>

            {/* Bước 4: Website Merchant */}
            <div className="md:col-span-1 flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center border border-green-200">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <span className="text-xs sm:text-sm font-bold uppercase text-slate-600">Website Bạn</span>
            </div>
          </div>
        </CardContent>
        </Card>

{/* Chỉ số chính */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <Card className="border-none shadow-md bg-primary text-white">
    <CardHeader className="pb-2">
    <CardDescription className="text-white/80 text-sm font-medium">Gói cước hiện tại</CardDescription>
            <CardTitle className="text-3xl font-bold uppercase mt-1">{profile?.planName || "Free"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/70 mt-2">Tổng số dư hiện tại: <span className="font-bold">{totalRemaining.toLocaleString()}</span></p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md md:col-span-2 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardDescription className="text-base font-medium text-slate-500">Số dư Giao dịch (Còn lại: <span className="font-bold text-primary">{totalRemaining}</span>)</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-600 font-bold uppercase mb-0.5">Tặng tháng này</p>
                <p className="text-[10px] text-blue-500 leading-tight">
                  Mỗi tháng bạn được tặng 50 GD.<br/>
                  Luôn reset 50 vào đầu tháng.<br/>
                  Dùng không hết sẽ mất.
                </p>
                <p className="text-xl font-bold text-blue-700">{txMonthly}</p>
                </div>
              <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Tặng ban đầu</p>
                <p className="text-xl font-bold text-emerald-700">{txWelcome}</p>
              </div>
              <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
                <p className="text-xs text-purple-600 font-bold uppercase mb-1">Đã mua</p>
                <p className="text-xl font-bold text-purple-700">{txPurchased}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription className="text-sm font-medium text-slate-500">Gmail Hook Status</CardDescription>
              <CardTitle className="text-3xl font-bold text-slate-800 mt-1">Hoạt động</CardTitle>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shadow-inner">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            </div>
          </CardHeader>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <Card className="lg:col-span-4 border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800">Giao dịch tuần này</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={13} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#888888" fontSize={13} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: 'rgba(111, 45, 189, 0.05)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800">Thông tin tài khoản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-5 rounded-xl bg-slate-50 space-y-4 border border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-base font-medium text-slate-600">Email đăng ký:</span>
                <span className="text-sm font-mono font-bold text-slate-900">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base font-medium text-slate-600">UID hệ thống:</span>
                <span className="text-sm font-mono text-slate-500 bg-white px-2 py-1 rounded border">{user?.uid?.substring(0, 8)}...</span>
              </div>
            </div>
            <Button asChild className="w-full bg-accent hover:bg-accent/90 shadow-md h-12 text-base font-bold">
              <Link href="/dashboard/billing">Nâng cấp tài khoản ngay</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}