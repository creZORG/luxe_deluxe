'use client';

import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Product } from '@/lib/products';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Check } from 'lucide-react';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const image = PlaceHolderImages.find((img) => img.id === product.imageId);
  const [selectedSize, setSelectedSize] = useState(product.sizes[1]);

  const handleAddToCart = () => {
    toast({
        title: "Added to Bag",
        description: `${product.name} (${selectedSize.size}) has been added to your bag.`,
        action: (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
              <Check className="h-4 w-4" />
            </div>
          ),
      });
  };

  return (
    <Card className="flex h-full transform-gpu flex-col overflow-hidden border-none shadow-lg transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl">
      <CardHeader className="p-0">
        <div className="group relative aspect-[3/4] w-full overflow-hidden">
          {image && (
            <Image
              src={image.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
              data-ai-hint={image.imageHint}
            />
          )}
           <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-6">
        <CardTitle className="font-headline text-xl font-semibold leading-tight">
          {product.name}
        </CardTitle>
        <CardDescription className="mt-2 flex-grow text-base">
          {product.description}
        </CardDescription>

        <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-foreground">Select Size:</p>
            <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                    <Button
                        key={size.size}
                        variant={selectedSize.size === size.size ? 'default' : 'outline'}
                        onClick={() => setSelectedSize(size)}
                        className={cn("rounded-full px-4 py-2 text-sm", selectedSize.size === size.size ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground")}
                    >
                        {size.size}
                    </Button>
                ))}
            </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
          <div className="flex w-full items-center justify-between">
            <p className="text-2xl font-bold text-foreground">
                ${selectedSize.price.toFixed(2)}
            </p>
            <Button onClick={handleAddToCart} className="bg-accent text-accent-foreground hover:bg-accent/90">Add to Bag</Button>
          </div>
      </CardFooter>
    </Card>
  );
}
