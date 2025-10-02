
import Image from 'next/image';
import { getSiteContent } from '@/lib/content';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function AboutSection() {
  const content = await getSiteContent();
  const image = content.images.find((img) => img.id === 'about-us-image');

  return (
    <section id="about" className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-y-12 lg:grid-cols-2 lg:gap-x-16">
          <div className="space-y-6 text-center lg:text-left">
            <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              From Our Family, For Yours.
            </h2>
            <p className="text-lg text-muted-foreground">
              Luna was born from a simple idea: that the essential products we use every day should be a source of joy, not a compromise. We grew tired of harsh chemicals and uninspired scents, and dreamt of a world where everyday routines could feel like small moments of luxury.
            </p>
            <p className="text-lg text-muted-foreground">
              We are a family-run business dedicated to crafting high-quality, plant-based home and body care essentials. Each formula is meticulously developed in our own lab, blending the finest natural ingredients with captivating fragrances to elevate your daily rituals. We believe in transparency, quality, and care—for your home, your body, and our planet.
            </p>
            <Button asChild size="lg" className="mt-4">
              <Link href="/shop">Explore Our Products</Link>
            </Button>
          </div>
          <div className="relative h-96 w-full lg:h-[32rem] rounded-lg overflow-hidden shadow-xl">
             {image && (
                <Image
                    src={image.imageUrl}
                    alt={image.description}
                    fill
                    className="object-cover"
                    data-ai-hint={image.imageHint}
                />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
