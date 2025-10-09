
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { getSiteContent, ImagePlaceholder } from '@/lib/content';

function CollectionCard({ title, description, image, link, large = false }: { title: string, description: string, image?: ImagePlaceholder, link: string, large?: boolean }) {
  return (
    <Link href={link} className={`group relative block overflow-hidden rounded-lg shadow-lg ${large ? 'md:col-span-2' : ''}`}>
      <div className="relative aspect-video w-full overflow-hidden md:aspect-[4/3]">
        <Image
          src={image?.imageUrl || "https://placehold.co/600x400"}
          alt={image?.description || title}
          fill
          className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          data-ai-hint={image?.imageHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      <div className="absolute bottom-0 p-6 text-white">
        <h3 className="font-headline text-2xl font-bold">{title}</h3>
        <p className="mt-1 text-sm max-w-xs">{description}</p>
        <div className="mt-4 flex items-center font-semibold">
          <span>{large ? 'Shop Now' : 'Explore'}</span>
          <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export default async function Home() {
  const content = await getSiteContent();
  
  const collectionImages = {
    fabricSofteners: content.images.find(img => img.id === content.collectionFabricSoftenersImageId),
    showerGels: content.images.find(img => img.id === content.collectionShowerGelsImageId),
    dishwash: content.images.find(img => img.id === content.collectionDishwashImageId),
  }

  return (
    <div className="space-y-24 py-16 md:py-24">
      {/* Hero Section */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12">
          <div className="space-y-6 text-center animate-fade-in-right animation-duration-1000">
            <h1 className="font-headline text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Luxury in Every Drop
            </h1>
            <p className="text-lg text-muted-foreground">
              Shower gels • Fabric softeners • Dishwash
            </p>
            <p className="max-w-md text-muted-foreground mx-auto">
              A curated collection of sensorial fragrances crafted for everyday elegance. Bold model collaborations, magazine-quality photoshoots, and artisan formulations — luxury reimagined.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Button asChild size="lg">
                <Link href="/shop">Shop Collections</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/gallery">Gallery</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Collections Section */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
            <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Curated Collections
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Immerse yourself in our world of fragrance, where each collection is a unique sensory story.
            </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <CollectionCard
            title="Fabric Softeners"
            description="Infuse your fabrics with lasting scents that evoke a sense of pure comfort and luxury."
            image={collectionImages.fabricSofteners}
            link="/shop?category=Fabric%20Softeners"
            large
          />
          <CollectionCard
            title="Shower Gels"
            description="Transform your daily cleanse into a moment of pure bliss."
            image={collectionImages.showerGels}
            link="/shop?category=Shower%20Gels"
          />
          <CollectionCard
            title="Dishwash"
            description="Elevate your kitchen routine with powerful, fragrant dish soap."
            image={collectionImages.dishwash}
            link="/shop?category=Dishwash"
          />
        </div>
      </section>
    </div>
  );
}
