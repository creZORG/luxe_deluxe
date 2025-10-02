
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getSiteContent, ImagePlaceholder } from '@/lib/content';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { ImageModal } from '@/components/ui/image-modal';

export default function GalleryPage() {
  const [images, setImages] = useState<ImagePlaceholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImagePlaceholder | null>(null);

  useEffect(() => {
    async function fetchImages() {
      const content = await getSiteContent();
      // Filter out placeholder images that might not be intended for the gallery
      const galleryImages = content.images.filter(img => !img.imageUrl.includes('placehold.co'));
      setImages(galleryImages);
      setLoading(false);
    }
    fetchImages();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage?.imageUrl || ''}
        altText={selectedImage?.description || 'Gallery image'}
      />
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Our Gallery
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            A glimpse into the world of Luna.
          </p>
        </div>
        
        {images.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
                <Card
                    key={image.id}
                    className="overflow-hidden cursor-pointer group"
                    onClick={() => setSelectedImage(image)}
                >
                    <div className="relative aspect-square w-full">
                        <Image
                            src={image.imageUrl}
                            alt={image.description}
                            fill
                            className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                         <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <p className="text-white text-center p-2">{image.description}</p>
                        </div>
                    </div>
                </Card>
            ))}
            </div>
        ) : (
            <div className="text-center py-12">
                <p className="text-muted-foreground">The gallery is currently empty. Check back soon!</p>
            </div>
        )}
      </div>
    </>
  );
}
