
'use client';

import { Inter } from 'next/font/google';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, LogOut, Package, ShoppingCart, Image as ImageIcon, Settings, Users, Percent, UserCog, Megaphone, Bitcoin, UserPlus
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

function PortalLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isAdminPath = pathname.startsWith('/admin');
  const isMarketerPath = pathname.startsWith('/digital-marketer');
  const isFulfillmentPath = pathname.startsWith('/fulfillment');

  const navItems = [
    // Admin
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'developer'] },
    { href: '/admin/users', icon: UserCog, label: 'Users', roles: ['admin', 'developer'] },
    { href: '/admin/products', icon: Package, label: 'Products', roles: ['admin', 'developer'] },
    { href: '/admin/sales-team', icon: Users, label: 'Sales Team', roles: ['admin', 'developer'] },
    { href: '/admin/site-content', icon: ImageIcon, label: 'Site Content', roles: ['admin', 'developer'] },
    { href: '/admin/global-settings', icon: Settings, label: 'Global Settings', roles: ['admin', 'developer'] },
    { href: '/admin/crypto', icon: Bitcoin, label: 'Crypto', roles: ['developer'] },
    // Marketer
    { href: '/digital-marketer/marketing', icon: Megaphone, label: 'Marketing', roles: ['digital_marketer'] },
    { href: '/digital-marketer/influencers', icon: UserPlus, label: 'Influencers', roles: ['digital_marketer'] },
    // Fulfillment
    { href: '/fulfillment/orders', icon: ShoppingCart, label: 'Orders', roles: ['fulfillment'] },
  ];

  const getAccessibleNavItems = () => {
    if (!user?.role) return [];
    if (isAdminPath) return navItems.filter(item => item.href.startsWith('/admin') && item.roles.includes(user.role));
    if (isMarketerPath) return navItems.filter(item => item.href.startsWith('/digital-marketer') && item.roles.includes(user.role));
    if (isFulfillmentPath) return navItems.filter(item => item.href.startsWith('/fulfillment') && item.roles.includes(user.role));
    return [];
  }
  
  const accessibleNavItems = getAccessibleNavItems();

  useEffect(() => {
    if (isClient && !loading) {
      if (!user) {
        router.push('/login');
        return;
      }
      const currentPortalPath = pathname.split('/')[1];
      const userAllowedPortals: string[] = [];
      if (['admin', 'developer'].includes(user.role)) userAllowedPortals.push('admin');
      if (['digital_marketer'].includes(user.role)) userAllowedPortals.push('digital-marketer');
      if (['fulfillment'].includes(user.role)) userAllowedPortals.push('fulfillment');

      if (!userAllowedPortals.includes(currentPortalPath)) {
         router.push('/login');
      }
    }
  }, [user, loading, router, pathname, isClient]);


  if (loading && isClient) {
    return <LoadingModal />;
  }
  
  if (!user) {
    return null; // or a loading state
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
                      <span className="sr-only">Logout</span>
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
            <PortalLayoutContent>{children}</PortalLayoutContent>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
