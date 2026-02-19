"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, RefreshCw, ShieldCheck, AlertCircle, ExternalLink } from "lucide-react";

export default function IntegrationsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline font-bold text-primary">Kết nối Gmail</h2>
          <p className="text-muted-foreground">Ứng dụng sẽ đọc email ngân hàng để tự động đối soát mã TTxxxxxx.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <RefreshCw className="w-4 h-4 mr-2" /> Đồng bộ thủ công
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-none shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Mail className="text-accent w-6 h-6" />
                </div>
                <div>
                  <CardTitle>Xác thực Google OAuth 2.0</CardTitle>
                  <CardDescription>Trạng thái: <span className="text-red-500 font-bold">CHƯA KẾT NỐI</span></CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 border rounded-xl bg-muted/30 space-y-4">
              <h3 className="font-bold">Cách thức hoạt động:</h3>
              <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-4">
                <li>Bấm nút kết nối bên dưới để mở trang xác thực của Google.</li>
                <li>Chọn tài khoản Gmail nhận thông báo từ ngân hàng.</li>
                <li>Chúng tôi chỉ đọc tiêu đề và nội dung email để tìm mã chuyển khoản.</li>
                <li>Hệ thống tự động gia hạn quyền truy cập mỗi 60 phút.</li>
              </ul>
              <Button size="lg" className="w-full bg-accent hover:bg-accent/90 mt-4 h-14 text-lg">
                <Mail className="mr-2" /> Kết nối với Google Gmail
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md flex flex-col justify-center p-8 bg-background border border-border">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">An toàn & Bảo mật</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Chúng tôi không bao giờ lưu mật khẩu của bạn. Quyền truy cập được quản lý trực tiếp bởi Google.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="w-3 h-3" /> Quyền đọc tối thiểu (Read-only)
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle>Cấu hình cho WordPress</CardTitle>
          <CardDescription>Làm thế nào để website của bạn nhận dữ liệu?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">1. Cài đặt Webhook</p>
              <p className="text-xs text-muted-foreground">Sao chép URL Webhook từ mục "Webhooks" dán vào Plugin xử lý trên WordPress của bạn.</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">2. Đối soát mã TTxxxxxx</p>
              <p className="text-xs text-muted-foreground">AI của chúng tôi sẽ gửi mã này về Webhook. Website của bạn chỉ cần kiểm tra mã này trong bảng đơn hàng.</p>
            </div>
          </div>
          <Button variant="outline" className="mt-2">
            <ExternalLink className="w-4 h-4 mr-2" /> Xem tài liệu tích hợp WordPress
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
