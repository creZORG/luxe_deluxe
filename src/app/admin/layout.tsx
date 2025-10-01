'use client';

import { Inter } from 'next/font/google';
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
import { LayoutDashboard, LogOut, Package, ShoppingCart, Image as ImageIcon } from 'lucide-react';
import { useAuth, AuthProvider } from '@/hooks/use-auth';
import { LunaLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';

const inter = Inter({ subsets: ['latin'] });

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !loading) {
        if (!user || user.role !== 'admin') {
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

  if (!user || user.role !== 'admin') {
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
                href="/admin/dashboard"
                isActive={pathname === '/admin/dashboard'}
              >
                <LayoutDashboard />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                href="/admin/products"
                isActive={pathname.startsWith('/admin/products')}
              >
                <Package />
                Products
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                href="/admin/website-images"
                isActive={pathname.startsWith('/admin/website-images')}
              >
                <ImageIcon />
                Website Images
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton href="#">
                    <ShoppingCart />
                    Orders
                </SidebarMenuButton>
            </SidebarMenuItem>
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
            <SidebarTrigger asChild>
                <Button variant="ghost" size="icon">
                    <LayoutDashboard />
                </Button>
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
