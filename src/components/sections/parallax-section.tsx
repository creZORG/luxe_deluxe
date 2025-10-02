
'use client';

import { useEffect, useState } from 'react';
import { getSiteContent, type ImagePlaceholder } from '@/lib/content';
import { useIsMobile } from '@/hooks/use-mobile';

type ParallaxSectionProps = {
  imageId: string;
};

export default function ParallaxSection({ imageId }: ParallaxSectionProps) {
  const [image, setImage] = useState<ImagePlaceholder | undefined>();
  const isMobile = useIsMobile();

  useEffect(() => {
    async function fetchImage() {
      const content = await getSiteContent();
      const foundImage = content.images.find((img) => img.id === imageId);
      setImage(foundImage);
    }
    fetchImage();
  }, [imageId]);

  if (!image) return null;

  return (
    <div
      className="h-64 bg-cover bg-center md:h-96"
      style={{
        backgroundImage: `url(${image.imageUrl})`,
        backgroundAttachment: isMobile ? 'scroll' : 'fixed',
      }}
      role="img"
      aria-label={image.description}
      data-ai-hint={image.imageHint}
    >
      {/* This div is used to create the parallax effect on desktop */}
    </div>
  );
}
