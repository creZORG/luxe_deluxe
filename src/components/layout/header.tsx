
'use client';

import {
  Menu,
  ShoppingCart,
  User,
  LogOut,
  Shield,
  UserCircle,
  Gem,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { LunaLogo } from '@/components/icons';
import CartSheet from '@/components/cart-sheet';
import { useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { ModeToggle } from '../mode-toggle';

const navLinks = [
  { href: '/shop', label: 'Shop' },
  { href: '/#about', label: 'Story' },
  { href: '/#blog', label: 'Journal' },
  { href: '/gallery', label: 'Gallery' },
];

function RewardsBar() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="relative bg-primary py-2 text-center text-sm text-primary-foreground">
      <div className="container flex items-center justify-center">
        <Gem className="mr-2 h-4 w-4" />
        <p>
          <span className="font-semibold">Earn STRAD Points</span> — Join our rewards program and earn points for the upcoming Tradints airdrop!
        </p>
      </div>
      <button onClick={() => setIsOpen(false)} className="absolute right-4 top-1/2 -translate-y-1/2">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function Header() {
  const [isCartOpen, setCartOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, logout, loading } = useAuth();

  const getInitials = (name = '') => {
    return name.split(' ').map(n => n[0]).join('');
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="bg-[#4a2e2a]">
        <div className="container flex h-16 max-w-7xl items-center">
          <div className="flex items-center">
              <Link
                  href="/"
                  className="mr-6 flex items-center space-x-2"
              >
                  <LunaLogo />
              </Link>
          </div>

          <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:text-white hover:bg-white/10"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col gap-6 pt-6">
                  <Link href="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                    <LunaLogo/>
                  </Link>
                  <div className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                      <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-medium text-foreground/80 transition-colors hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                      >
                      {link.label}
                      </Link>
                  ))}
                   {user?.role === 'admin' && !loading && (
                      <Link
                          href="/admin/dashboard"
                          className="text-lg font-medium text-primary transition-colors hover:text-primary/80"
                          onClick={() => setMobileMenuOpen(false)}
                      >
                          Admin
                      </Link>
                  )}
                  </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="flex flex-1 items-center justify-end space-x-4">
              <nav className="hidden md:flex items-center gap-6 text-sm">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="font-medium text-white/80 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              
              <div className="flex items-center gap-2">
                <ModeToggle />

                {loading ? (
                  <Skeleton className="h-8 w-8 rounded-full" />
                ) : user ? (
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full text-white hover:text-white hover:bg-white/10">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/profile">
                              <UserCircle className="mr-2 h-4 w-4" />
                              <span>Profile</span>
                            </Link>
                        </DropdownMenuItem>
                        {user.role === 'admin' && (
                          <DropdownMenuItem asChild>
                             <Link href="/admin/dashboard">
                              <Shield className="mr-2 h-4 w-4" />
                              <span>Admin</span>
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => logout()}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10">
                      Login
                    </Button>
                  </Link>
                )}

                <div className="relative">
                  <Button variant="ghost" size="icon" onClick={() => setCartOpen(true)} className="text-white hover:text-white hover:bg-white/10">
                      <ShoppingCart className="h-5 w-5" />
                      <span className="sr-only">Open cart</span>
                  </Button>
                  {totalItems > 0 && (
                    <div className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {totalItems}
                    </div>
                  )}
                </div>
              </div>
              <CartSheet open={isCartOpen} onOpenChange={setCartOpen} />
          </div>
        </div>
      </div>
      <RewardsBar />
    </header>
  );
}
