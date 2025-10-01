'use client';

import { PlaceHolderImages } from '@/lib/placeholder-images';

type ParallaxSectionProps = {
  imageId: string;
};

export default function ParallaxSection({ imageId }: ParallaxSectionProps) {
  const image = PlaceHolderImages.find((img) => img.id === imageId);

  if (!image) return null;

  return (
    <div
      className="h-64 md:h-96 bg-cover bg-fixed bg-center"
      style={{ backgroundImage: `url(${image.imageUrl})` }}
      role="img"
      aria-label={image.description}
      data-ai-hint={image.imageHint}
    >
      {/* This div is used to create the parallax effect */}
    </div>
  );
}
