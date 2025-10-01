'use client';

import { Inter } from 'next/font/google';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { LayoutDashboard, LogOut, Package, ShoppingCart, Image as ImageIcon, Settings, Users, Percent, UserCog } from 'lucide-react';
import { useAuth, AuthProvider } from '@/hooks/use-auth';
import { LunaLogo } from '@/components/icons';

const inter = Inter({ subsets: ['latin'] });

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const isAdmin = user?.role === 'admin';
  const isFulfillment = user?.role === 'fulfillment';

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !loading) {
        if (!user || (user.role !== 'admin' && user.role !== 'fulfillment')) {
            router.push('/login');
        }
    }
  }, [user, loading, router, pathname, isClient]);

  if (loading && isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'fulfillment')) {
    return null;
  }

  return (
    <SidebarProvider>
      <Sidebar variant="floating" collapsible="offcanvas">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <LunaLogo />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/admin/dashboard'}
              >
                <Link href="/admin/dashboard">
                  <LayoutDashboard />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {(isAdmin || isFulfillment) && (
                 <SidebarMenuItem>
                    <SidebarMenuButton 
                        asChild
                        isActive={pathname.startsWith('/admin/orders')}
                    >
                        <Link href="/admin/orders">
                            <ShoppingCart />
                            Orders
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            )}
            {isAdmin && (
                <>
                    <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith('/admin/users')}
                    >
                        <Link href="/admin/users">
                        <UserCog />
                        Users
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith('/admin/products')}
                    >
                        <Link href="/admin/products">
                        <Package />
                        Products
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith('/admin/influencers')}
                    >
                        <Link href="/admin/influencers">
                        <Percent />
                        Influencers
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith('/admin/sales-team')}
                    >
                        <Link href="/admin/sales-team">
                        <Users />
                        Sales Team
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith('/admin/site-content')}
                    >
                        <Link href="/admin/site-content">
                        <ImageIcon />
                        Site Content
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith('/admin/global-settings')}
                    >
                        <Link href="/admin/global-settings">
                        <Settings />
                        Global Settings
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                </>
            )}
          </SidebarMenu>
        </SidebarContent>
        <div className="mt-auto p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={logout}>
                <LogOut />
                Logout
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <div className="flex items-center gap-2 p-2 lg:p-4">
            <SidebarTrigger>
                <LayoutDashboard />
            </SidebarTrigger>
            <h2 className="text-xl font-semibold">Admin Panel</h2>
        </div>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}
