
"use client";

import { SidebarProvider, SidebarInset, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarFooter, SidebarTrigger } from "@/components/ui/sidebar";
import { ShieldCheck, Users, BarChart3, Globe, Bell, FileCode, Settings, History, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-border bg-slate-900 text-slate-100">
        <SidebarHeader className="h-16 flex items-center px-6 border-b border-slate-800">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold">AD</div>
            <span className="font-headline font-bold text-lg group-data-[collapsible=icon]:hidden">
              Admin Panel
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="py-4">
          <SidebarGroup>
            <SidebarGroupLabel className="px-6 text-slate-500 text-[10px] uppercase font-bold">Management</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Tổng quan">
                  <Link href="/admin" className="flex items-center gap-3 px-6 py-2 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
                    <BarChart3 className="w-5 h-5" />
                    <span>Hệ thống</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Người dùng">
                  <Link href="/admin/users" className="flex items-center gap-3 px-6 py-2 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
                    <Users className="w-5 h-5" />
                    <span>Khách hàng</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Lịch sử Giao dịch">
                  <Link href="/admin/transactions" className="flex items-center gap-3 px-6 py-2 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
                    <History className="w-5 h-5" />
                    <span>Lịch sử Giao dịch</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Cảnh báo">
                  <Link href="/admin/alerts" className="flex items-center gap-3 px-6 py-2 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    <span>Cảnh báo cước</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Tài liệu hệ thống">
                  <Link href="/admin/system-docs" className="flex items-center gap-3 px-6 py-2 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
                    <FileCode className="w-5 h-5" />
                    <span>Tài liệu hệ thống</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Cài đặt Hệ thống">
                  <Link href="/admin/settings" className="flex items-center gap-3 px-6 py-2 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
                    <Settings className="w-5 h-5" />
                    <span>Cài đặt Hệ thống</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-slate-800 p-4">
           <SidebarMenu>
             <SidebarMenuItem>
               <SidebarMenuButton asChild>
                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white">
                  <Globe className="w-5 h-5" />
                  <span>Về User App</span>
                </Link>
              </SidebarMenuButton>
             </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-slate-50">
        <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-1 overflow-hidden">
            <Button onClick={() => router.back()} variant="ghost" size="icon" className="md:hidden">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <SidebarTrigger className="md:hidden" />
            <div className="items-center gap-2 hidden sm:flex">
              <ShieldCheck className="w-5 h-5 text-accent flex-shrink-0" />
              <h1 className="text-base md:text-xl font-bold text-slate-800 truncate">
                Quản trị viên
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
             <LanguageSwitcher />
             <Badge variant="outline" className="text-accent border-accent">Super Admin</Badge>
          </div>
          </header>
        <main className="p-4 md:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
