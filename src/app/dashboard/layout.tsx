
"use client";

import { SidebarProvider, SidebarInset, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarFooter, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, Webhook, Settings, Mail, LogOut, CreditCard, ShieldCheck, History, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useFirebase, useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc } from "firebase/firestore";
import { Button } from "@/components/ui/button"; // Thêm dòng import này

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { auth } = useFirebase();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  // Lấy thông tin profile từ Firestore để kiểm tra quyền
  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, "users", user.uid);
  },[firestore, user?.uid]);

  const { data: profile } = useDoc(userProfileRef);
  const isAdmin = profile?.role === 'admin';

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-border bg-white">
      <SidebarHeader className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
              P
            </div>
            <span className="font-headline font-bold text-lg tracking-tight group-data-[collapsible=icon]:hidden">
              PayMailHook
            </span>
            </Link>
        </SidebarHeader>
        <SidebarContent className="py-4">
          <SidebarGroup>
            <SidebarGroupLabel className="px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Main</SidebarGroupLabel>
            <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard">
                  <Link href="/dashboard" className="flex items-center gap-3 px-6 py-2 transition-colors hover:bg-secondary group">
                    <LayoutDashboard className="w-5 h-5 text-muted-foreground group-hover:text-accent" />
                    <span className="font-medium">Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Gmail Hook">
                  <Link href="/dashboard/integrations" className="flex items-center gap-3 px-6 py-2 transition-colors hover:bg-secondary group">
                    <Mail className="w-5 h-5 text-muted-foreground group-hover:text-accent" />
                    <span className="font-medium">Gmail Hook</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Webhooks">
                  <Link href="/dashboard/webhooks" className="flex items-center gap-3 px-6 py-2 transition-colors hover:bg-secondary group">
                    <Webhook className="w-5 h-5 text-muted-foreground group-hover:text-accent" />
                    <span className="font-medium">Webhooks</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Hộp thư trung gian">
                  <Link href="/dashboard/inbox" className="flex items-center gap-3 px-6 py-2 transition-colors hover:bg-secondary group">
                    <Mail className="w-5 h-5 text-muted-foreground group-hover:text-accent" />
                    <span className="font-medium">Hộp thư trung gian</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Lịch sử Webhook">
                  <Link href="/dashboard/history" className="flex items-center gap-3 px-6 py-2 transition-colors hover:bg-secondary group">
                    <History className="w-5 h-5 text-muted-foreground group-hover:text-accent" />
                    <span className="font-medium">Lịch sử Webhook</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">System</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Billing">
                  <Link href="/dashboard/billing" className="flex items-center gap-3 px-6 py-2 transition-colors hover:bg-secondary group">
                    <CreditCard className="w-5 h-5 text-muted-foreground group-hover:text-accent" />
                    <span className="font-medium">Gói cước</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                  <Link href="/dashboard/settings" className="flex items-center gap-3 px-6 py-2 transition-colors hover:bg-secondary group">
                    <Settings className="w-5 h-5 text-muted-foreground group-hover:text-accent" />
                    <span className="font-medium">Cài đặt</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Nút này chỉ hiện ra nếu tài khoản có role là admin */}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Admin Panel">
                    <Link href="/admin" className="flex items-center gap-3 px-6 py-2 transition-colors hover:bg-amber-50 group">
                      <ShieldCheck className="w-5 h-5 text-amber-500 group-hover:text-amber-600" />
                      <span className="font-medium text-amber-600">Trang Quản trị</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-border p-4">
          <SidebarMenuButton asChild>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Đăng xuất</span>
            </button>
          </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="h-16 border-b border-border bg-white flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-1">
            <Button onClick={() => router.back()} variant="ghost" size="icon" className="md:hidden">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-lg md:text-xl font-headline font-bold text-primary truncate hidden sm:block">Bảng điều khiển</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <LanguageSwitcher />
            <div className="text-right mr-2 hidden sm:block">
              <p className="text-sm font-bold">Người dùng App</p>
              <p className="text-xs text-muted-foreground">Tài khoản Premium</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold">
              AU
            </div>
          </div>
          </header>
        <main className="p-4 md:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
