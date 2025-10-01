'use client';

import {
  Menu,
  ShoppingCart,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { LuxeDailyLogo } from '@/components/icons';
import CartSheet from '@/components/cart-sheet';
import { useState } from 'react';

const navLinks = [
  { href: '#products', label: 'Shop' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
  { href: '#sustainability', label: 'Sustainability' },
];

export default function Header() {
  const [isCartOpen, setCartOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center">
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="mr-6 flex items-center space-x-2"
          >
            <LuxeDailyLogo className="text-xl" />
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-medium text-foreground/60 transition-colors hover:text-foreground/80"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="flex flex-col gap-6 pt-6">
                <Link href="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                  <LuxeDailyLogo className="text-lg"/>
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
                </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
            <div className="md:hidden">
              <Link href="/">
                <LuxeDailyLogo className="text-xl"/>
                <span className="sr-only">Luxe Daily Home</span>
              </Link>
            </div>
            <CartSheet open={isCartOpen} onOpenChange={setCartOpen}>
                <Button variant="ghost" size="icon" onClick={() => setCartOpen(true)}>
                    <ShoppingCart className="h-5 w-5" />
                    <span className="sr-only">Open cart</span>
                </Button>
            </CartSheet>
        </div>
      </div>
    </header>
  );
}
