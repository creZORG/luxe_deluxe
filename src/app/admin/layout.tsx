
'use client';

import { Inter } from 'next/font/google';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, LogOut, Package, ShoppingCart, Image as ImageIcon, Settings, Users, Percent, UserCog, Megaphone, Sun, Moon
} from 'lucide-react';
import { useAuth, AuthProvider } from '@/hooks/use-auth';
import { LunaLogo } from '@/components/icons';
import { LoadingModal } from '@/components/ui/loading-modal';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ModeToggle } from '@/components/mode-toggle';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const isAdmin = user?.role === 'admin';
  const isFulfillment = user?.role === 'fulfillment';
  const isDigitalMarketer = user?.role === 'digital_marketer';

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !loading) {
      if (!user || (user.role !== 'admin' && user.role !== 'fulfillment' && user.role !== 'digital_marketer')) {
        router.push('/login');
      }
    }
  }, [user, loading, router, pathname, isClient]);

  const navItems = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'fulfillment', 'digital_marketer'] },
    { href: '/admin/orders', icon: ShoppingCart, label: 'Orders', roles: ['admin', 'fulfillment'] },
    { href: '/admin/marketing', icon: Megaphone, label: 'Marketing', roles: ['admin', 'digital_marketer'] },
    { href: '/admin/users', icon: UserCog, label: 'Users', roles: ['admin'] },
    { href: '/admin/products', icon: Package, label: 'Products', roles: ['admin'] },
    { href: '/admin/influencers', icon: Percent, label: 'Influencers', roles: ['admin'] },
    { href: '/admin/sales-team', icon: Users, label: 'Sales Team', roles: ['admin'] },
    { href: '/admin/site-content', icon: ImageIcon, label: 'Site Content', roles: ['admin'] },
    { href: '/admin/global-settings', icon: Settings, label: 'Global Settings', roles: ['admin'] },
  ];

  const accessibleNavItems = navItems.filter(item => user?.role && item.roles.includes(user.role));

  if (loading && isClient) {
    return <LoadingModal />;
  }

  if (!user || (user.role !== 'admin' && user.role !== 'fulfillment' && user.role !== 'digital_marketer')) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
           <Link href="/">
              <LunaLogo />
            </Link>
          <div className="ml-auto flex items-center gap-2">
            <ModeToggle />
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 mb-20">{children}</main>
        <nav className="fixed inset-x-0 bottom-4 z-50 mx-auto w-fit">
          <div className="flex items-center gap-2 rounded-full border bg-background p-2 shadow-lg">
            {accessibleNavItems.map((item) => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "rounded-full",
                        pathname.startsWith(item.href) ? "bg-muted text-foreground" : "text-muted-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="sr-only">{item.label}</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </nav>
      </div>
    </TooltipProvider>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AdminLayoutContent>{children}</AdminLayoutContent>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
