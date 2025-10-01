import Link from 'next/link';
import { Instagram, Twitter, Youtube } from 'lucide-react';
import { LuxeDailyLogo } from '@/components/icons';

export default function Footer() {
  return (
    <footer className="bg-card text-card-foreground">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between space-y-6 md:flex-row md:space-y-0">
          <div className="flex flex-col items-center md:items-start">
            <LuxeDailyLogo />
            <p className="mt-2 text-sm text-muted-foreground">Luxury in Every Drop.</p>
          </div>

          <div className="flex space-x-6 text-sm font-medium">
            <Link href="#products" className="text-muted-foreground transition-colors hover:text-foreground">Shop</Link>
            <Link href="#about" className="text-muted-foreground transition-colors hover:text-foreground">About</Link>
            <Link href="#contact" className="text-muted-foreground transition-colors hover:text-foreground">Contact</Link>
            <Link href="#sustainability" className="text-muted-foreground transition-colors hover:text-foreground">Sustainability</Link>
          </div>

          <div className="flex space-x-6">
            <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
              <Youtube className="h-5 w-5" />
              <span className="sr-only">YouTube</span>
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Luxe Daily. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
