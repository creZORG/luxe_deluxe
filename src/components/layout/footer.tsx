
import Link from 'next/link';
import { Instagram, Twitter, Youtube, Facebook, Linkedin, LucideIcon } from 'lucide-react';
import { LunaLogo } from '@/components/icons';
import { getSiteContent } from '@/lib/content';

// Map platform names to Lucide icons
const iconMap: { [key: string]: LucideIcon } = {
  Instagram: Instagram,
  Twitter: Twitter,
  Youtube: Youtube,
  Facebook: Facebook,
  Linkedin: Linkedin,
  // Add other platforms and their icons here
};

export default async function Footer() {
  const { contact, socialMedia } = await getSiteContent();

  return (
    <footer className="bg-card text-card-foreground">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between space-y-6 md:flex-row md:space-y-0">
          <div className="flex flex-col items-center md:items-start">
            <LunaLogo />
            <p className="mt-2 text-sm text-muted-foreground">Luxury in Every Drop.</p>
          </div>

          <div className="flex space-x-6 text-sm font-medium">
            <Link href="/shop" className="text-muted-foreground transition-colors hover:text-foreground">Shop</Link>
            <Link href="/#about" className="text-muted-foreground transition-colors hover:text-foreground">About</Link>
            <Link href="/#sustainability" className="text-muted-foreground transition-colors hover:text-foreground">Sustainability</Link>
             <Link href="/#blog" className="text-muted-foreground transition-colors hover:text-foreground">Blog</Link>
          </div>

          <div className="flex space-x-6">
            {socialMedia.map((social) => {
              const Icon = iconMap[social.platform];
              if (!Icon) return null;
              return (
                <Link key={social.platform} href={social.url} className="text-muted-foreground transition-colors hover:text-foreground">
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{social.platform}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground space-y-2">
            <p>© {new Date().getFullYear()} Luna. All rights reserved.</p>
            <p>{contact.email} | {contact.phone} | {contact.address}</p>
        </div>
      </div>
    </footer>
  );
}
