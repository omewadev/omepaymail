import { SidebarProvider, SidebarInset, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarFooter } from "@/components/ui/sidebar";
import { LayoutDashboard, Webhook, Settings, History, Mail, LogOut, CreditCard } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-border bg-white">
        <SidebarHeader className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
              P
            </div>
            <span className="font-headline font-bold text-lg tracking-tight group-data-[collapsible=icon]:hidden">
              PayMailHook
            </span>
          </div>
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
                <SidebarMenuButton asChild tooltip="Webhooks">
                  <Link href="/dashboard/webhooks" className="flex items-center gap-3 px-6 py-2 transition-colors hover:bg-secondary group">
                    <Webhook className="w-5 h-5 text-muted-foreground group-hover:text-accent" />
                    <span className="font-medium">Webhooks</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Integrations">
                  <Link href="/dashboard/integrations" className="flex items-center gap-3 px-6 py-2 transition-colors hover:bg-secondary group">
                    <Mail className="w-5 h-5 text-muted-foreground group-hover:text-accent" />
                    <span className="font-medium">Gmail Hook</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">System</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Logs">
                  <Link href="/dashboard/logs" className="flex items-center gap-3 px-6 py-2 transition-colors hover:bg-secondary group">
                    <History className="w-5 h-5 text-muted-foreground group-hover:text-accent" />
                    <span className="font-medium">Audit Logs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                  <Link href="/dashboard/settings" className="flex items-center gap-3 px-6 py-2 transition-colors hover:bg-secondary group">
                    <Settings className="w-5 h-5 text-muted-foreground group-hover:text-accent" />
                    <span className="font-medium">Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-border p-4">
          <SidebarMenuButton asChild>
            <Link href="/" className="flex items-center gap-3 px-4 py-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Log out</span>
            </Link>
          </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="h-16 border-b border-border bg-white flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-headline font-bold text-primary">Control Panel</h1>
          <div className="flex items-center gap-4">
            <div className="text-right mr-2 hidden sm:block">
              <p className="text-sm font-bold">Admin User</p>
              <p className="text-xs text-muted-foreground">Premium Account</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold">
              AU
            </div>
          </div>
        </header>
        <main className="p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
