"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
   LayoutDashboard,
   Package,
   FolderTree,
   ShoppingCart,
   Users,
   BarChart3,
   Settings,
   LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
   Sidebar,
   SidebarContent,
   SidebarFooter,
   SidebarGroup,
   SidebarGroupContent,
   SidebarGroupLabel,
   SidebarHeader,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
   SidebarProvider,
   SidebarTrigger,
} from "@/components/ui/sidebar";

const navItems = [
   {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
   },
   {
      title: "Products",
      href: "/admin/products",
      icon: Package,
   },
   {
      title: "Categories",
      href: "/admin/categories",
      icon: FolderTree,
   },
   {
      title: "Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
   },
   {
      title: "Users",
      href: "/admin/users",
      icon: Users,
   },
   {
      title: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
   },
   {
      title: "Constants",
      href: "/admin/constants",
      icon: Settings,
   },
];

function AppSidebar() {
   const pathname = usePathname();
   const { user, logout } = useAuth();

   return (
      <Sidebar>
         <SidebarHeader className="border-b px-6 py-4">
            <div className="flex items-center gap-2">
               <Package className="h-6 w-6" />
               <span className="text-lg font-semibold">Admin Panel</span>
            </div>
         </SidebarHeader>
         <SidebarContent>
            <SidebarGroup>
               <SidebarGroupLabel>Navigation</SidebarGroupLabel>
               <SidebarGroupContent>
                  <SidebarMenu>
                     {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                           <SidebarMenuItem key={item.href}>
                              <SidebarMenuButton asChild isActive={isActive}>
                                 <Link href={item.href}>
                                    <Icon className="h-4 w-4" />
                                    <span>{item.title}</span>
                                 </Link>
                              </SidebarMenuButton>
                           </SidebarMenuItem>
                        );
                     })}
                  </SidebarMenu>
               </SidebarGroupContent>
            </SidebarGroup>
         </SidebarContent>
         <SidebarFooter className="border-t p-4">
            <div className="mb-2 px-2">
               <p className="text-sm font-medium">{user?.email}</p>
               <p className="text-xs text-muted-foreground">
                  {user?.is_admin ? "Administrator" : "User"}
               </p>
            </div>
            <Button
               variant="outline"
               className="w-full justify-start"
               onClick={logout}
            >
               <LogOut className="mr-2 h-4 w-4" />
               Logout
            </Button>
         </SidebarFooter>
      </Sidebar>
   );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
   const { user, loading, isAdmin } = useAuth();
   const [mounted, setMounted] = React.useState(false);

   React.useEffect(() => {
      setMounted(true);
   }, []);

   React.useEffect(() => {
      if (mounted && !loading && (!user || !isAdmin)) {
         window.location.href = "/login?redirect=/admin";
      }
   }, [mounted, loading, user, isAdmin]);

   if (!mounted || loading) {
      return (
         <div className="flex h-screen items-center justify-center">
            <div className="text-center">
               <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
               <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
            </div>
         </div>
      );
   }

   if (!user || !isAdmin) {
      return null;
   }

   return (
      <SidebarProvider>
         <div className="flex min-h-screen w-full">
            <AppSidebar />
            <main className="flex-1">
               <div className="border-b bg-background">
                  <div className="flex h-14 items-center px-4 lg:px-6">
                     <SidebarTrigger />
                  </div>
               </div>
               <div className="flex-1 space-y-4 p-4 pt-6 lg:p-8">
                  {children}
               </div>
            </main>
         </div>
      </SidebarProvider>
   );
}
