
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CreditCard, CheckCircle2, Mail, Webhook as WebhookIcon, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

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
  const usage = 85; // Giả lập 85% hạn mức
  const isWarning = usage >= 80;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Cảnh báo hạn mức */}
      {isWarning && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3 text-amber-800">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-bold text-sm">Cảnh báo hạn mức: Bạn đã sử dụng {usage}% gói cước!</p>
              <p className="text-xs opacity-80">Hãy nâng cấp gói để tránh việc gián đoạn xác nhận đơn hàng.</p>
            </div>
          </div>
          <Badge variant="outline" className="border-amber-400 text-amber-700 bg-white">Sắp hết hạn mức</Badge>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-md bg-primary text-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-white/70 text-xs">Tổng tiền đối soát</CardDescription>
            <CardTitle className="text-2xl font-bold">128.5M VNĐ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-white/50">+15% so với hôm qua</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Giao dịch / Hạn mức</CardDescription>
            <CardTitle className="text-2xl font-bold">850 / 1,000</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={usage} className={`h-2 ${isWarning ? 'bg-amber-100' : 'bg-muted'}`} />
            <p className="text-[10px] text-muted-foreground text-right">{usage}% đã dùng</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription className="text-xs">Gmail Webhook</CardDescription>
              <CardTitle className="text-2xl font-bold">Đang chạy</CardTitle>
            </div>
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Tỉ lệ Webhook thành công</CardDescription>
            <CardTitle className="text-2xl font-bold">99.9%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        <Card className="lg:col-span-4 border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Biểu đồ giao dịch tuần này</CardTitle>
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
            <CardTitle className="text-lg">Thông tin gói cước</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-secondary/30 space-y-3 border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Gói hiện tại:</span>
                <Badge className="bg-accent">PRO PLAN</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Ngày hết hạn:</span>
                <span className="text-sm">25/12/2024</span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold">Lịch sử nâng cấp</h4>
              <div className="text-xs space-y-2">
                <div className="flex justify-between text-muted-foreground border-b pb-1">
                  <span>Gói Pro (Tháng 11)</span>
                  <span className="text-primary font-bold">Thành công</span>
                </div>
                <div className="flex justify-between text-muted-foreground border-b pb-1">
                  <span>Gói Pro (Tháng 10)</span>
                  <span className="text-primary font-bold">Thành công</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
