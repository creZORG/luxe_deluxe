
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { getSiteContent } from '@/lib/content';
import Link from 'next/link';

export default async function HeroSection() {
  const content = await getSiteContent();
  const heroImage = content.images.find((img) => img.id === content.heroImageId);
  const heroImageUrl = heroImage ? heroImage.imageUrl : 'https://placehold.co/1920x1080';

  return (
    <section className="relative h-[calc(100vh-4rem)] w-full">
      <Image
          src={heroImageUrl}
          alt={heroImage?.description || 'Homepage hero image'}
          fill
          className="object-cover"
          priority
          data-ai-hint={heroImage?.imageHint || 'luxury products'}
        />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
        <h1 className="font-headline text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl animate-fade-in [animation-delay:200ms] animation-duration-1000">
          Elevating Everyday Essentials.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-white/90 md:text-xl animate-fade-in [animation-delay:400ms] animation-duration-1000">
          Shower Gels, Fabric Softeners & Dishwash crafted with care.
        </p>
        <Link href="/shop" passHref>
          <Button
            size="lg"
            className="mt-8 rounded-full border border-white/20 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 animate-fade-in [animation-delay:600ms] animation-duration-1000"
          >
            Shop Now
          </Button>
        </Link>
      </div>
    </section>
  );
}
