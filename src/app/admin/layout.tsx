
'use client';

import { Inter } from 'next/font/google';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, LogOut, Package, ShoppingCart, Image as ImageIcon, Settings, Users, Percent, UserCog, Megaphone
} from 'lucide-react';
import { useAuth, AuthProvider } from '@/hooks/use-auth';
import { LoadingModal } from '@/components/ui/loading-modal';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ModeToggle } from '@/components/mode-toggle';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

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
    { href: '/admin/site-content', icon: ImageIcon, label: 'Site Content', roles: ['admin', 'digital_marketer'] },
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 mb-24">{children}</main>
        
        <nav className="group fixed inset-x-0 bottom-4 z-50 mx-auto w-fit">
          <div className="flex items-center gap-2 rounded-full border bg-background p-2 shadow-lg transition-all duration-300 ease-in-out md:group-hover:gap-4 md:group-hover:px-4">
            {accessibleNavItems.map((item) => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-3 py-2 transition-colors",
                      pathname.startsWith(item.href) ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="nav-label text-sm font-medium">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top" className="md:hidden">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ))}
            
            <Separator orientation="vertical" className="mx-1 h-6 hidden md:group-hover:block" />

            <div className="hidden md:group-hover:flex md:group-hover:items-center md:group-hover:gap-2">
                <ModeToggle />
                 <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      onClick={logout}
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="nav-label text-sm font-medium">Logout</span>
                 </Button>
            </div>
             <div className="flex items-center gap-2 md:group-hover:hidden">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div>
                            <ModeToggle />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        Toggle Theme
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          onClick={logout}
                        >
                          <LogOut className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        Logout
                    </TooltipContent>
                </Tooltip>
            </div>
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
