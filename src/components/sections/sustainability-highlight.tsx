
import Image from 'next/image';
import { getSiteContent } from '@/lib/content';

export default async function SustainabilityHighlight() {
  const content = await getSiteContent();
  const bannerImage = content.images.find((img) => img.id === 'sustainability-banner');

  return (
    <section id="sustainability" className="relative h-96 w-full text-white">
      {bannerImage && (
        <Image
          src={bannerImage.imageUrl}
          alt={bannerImage.description}
          fill
          className="object-cover"
          data-ai-hint={bannerImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center p-4">
        <h2 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
          Committed to a Greener World
        </h2>
        <p className="mt-4 max-w-3xl text-lg text-white/90">
          We believe in luxury that doesn't cost the earth. Our products are packaged in recyclable materials, and we are constantly striving to reduce our environmental footprint.
        </p>
      </div>
    </section>
  );
}
