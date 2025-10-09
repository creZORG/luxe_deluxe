

'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Product } from '@/lib/products';
import { getProductBySlug, getProducts, incrementProductView, submitProductRating } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { toast } from '@/hooks/use-toast';
import { Check, Star, Loader2, Minus, Plus, Zap, Bookmark } from 'lucide-react';
import ProductCard from '@/components/product-card';
import { PremiumSkeleton } from '@/components/ui/premium-skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';

type ProductPageProps = {
  params: {
    slug: string;
  };
};

function StarRating({ rating, onRatingChange, disabled }: { rating: number, onRatingChange?: (rating: number) => void, disabled?: boolean }) {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={cn(
                        'h-5 w-5',
                        (hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300',
                        !disabled && 'cursor-pointer'
                    )}
                    onMouseEnter={!disabled ? () => setHoverRating(star) : undefined}
                    onMouseLeave={!disabled ? () => setHoverRating(0) : undefined}
                    onClick={!disabled ? () => onRatingChange?.(star) : undefined}
                />
            ))}
        </div>
    );
}

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchProductData = async () => {
    setLoading(true);
    const fetchedProduct = await getProductBySlug(params.slug);

    if (fetchedProduct) {
      incrementProductView(fetchedProduct.id);
      setProduct(fetchedProduct);
      const allProducts = await getProducts();
      const related = allProducts
        .filter(p => p.category === fetchedProduct.category && p.id !== fetchedProduct.id)
        .slice(0, 3);
      setRelatedProducts(related);
    } else {
      notFound();
    }
    setLoading(false);
  };
  
  useEffect(() => {
    fetchProductData();
  }, [params.slug]);


  const [selectedSize, setSelectedSize] = useState<{size: string, price: number, quantityAvailable: number} | null>(null);

  useEffect(() => {
    if (product && product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    } else {
      setSelectedSize(null);
    }
  }, [product]);

  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const router = useRouter();

  const handleAddToCart = () => {
    if (!product || !selectedSize) return;
    addItem({
      product,
      size: selectedSize.size,
      price: selectedSize.price,
      quantity,
    });
    toast({
      title: 'Added to Bag',
      description: `${quantity} x ${product.name} (${selectedSize.size}) added.`,
      action: (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
          <Check className="h-4 w-4" />
        </div>
      ),
    });
  };

  const handleBuyNow = () => {
    if (!product || !selectedSize) return;
    addItem({
      product,
      size: selectedSize.size,
      price: selectedSize.price,
      quantity,
    });
    router.push('/checkout');
  };

  const totalPrice = useMemo(() => {
    if (!selectedSize) return 0;
    return selectedSize.price * quantity;
  }, [selectedSize, quantity]);

  
  if (loading || !product) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <PremiumSkeleton className="aspect-square w-full lg:aspect-[3/4] rounded-lg" />
          <div className="flex flex-col justify-center gap-4">
            <PremiumSkeleton className="h-12 w-3/4" />
            <PremiumSkeleton className="h-6 w-1/4" />
            <PremiumSkeleton className="h-8 w-1/3" />
            <PremiumSkeleton className="h-20 w-full" />
            <div className="flex gap-4 mt-4">
              <PremiumSkeleton className="h-12 w-1/2 rounded-full" />
              <PremiumSkeleton className="h-12 w-1/2 rounded-full" />
            </div>
            <div className="flex gap-4 mt-4">
                <PremiumSkeleton className="h-12 flex-1" />
                <PremiumSkeleton className="h-12 flex-1" />
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div>
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Product Image */}
          <div className="aspect-square w-full lg:aspect-[3/4]">
            <div className="relative h-full w-full overflow-hidden rounded-lg shadow-lg">
              {product.imageId && (
                <Image
                  src={product.imageId}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-start">
             <p className="text-sm text-muted-foreground">{product.category}</p>
             <div className="flex justify-between items-center mt-2">
                <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  {product.name}
                </h1>
                <Button variant="ghost" size="icon">
                    <Bookmark className="h-6 w-6" />
                </Button>
             </div>
             <div className="flex items-center gap-2 mt-2">
                <StarRating rating={product.averageRating || 0} disabled />
                <span className="text-sm text-muted-foreground">({product.reviewCount || 0} reviews)</span>
             </div>
            
            {product.sizes && product.sizes.length > 0 && selectedSize ? (
              <>
                <p className="mt-4 text-3xl font-semibold text-foreground">
                  Ksh {selectedSize.price.toFixed(2)}
                </p>

                {/* Size Selector */}
                <div className="mt-6">
                  <h2 className="text-sm font-medium text-foreground">
                    Size
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <Button
                        key={size.size}
                        variant={selectedSize?.size === size.size ? 'default' : 'outline'}
                        onClick={() => setSelectedSize(size)}
                        className="min-w-[80px] rounded-md"
                      >
                        {size.size}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="mt-6">
                    <h2 className="text-sm font-medium text-foreground">Quantity</h2>
                    <div className="flex items-center gap-4 mt-2">
                         <div className="flex items-center gap-2 rounded-md border p-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></Button>
                            <span className="w-10 text-center font-medium">{quantity}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => q + 1)}><Plus className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </div>

                <Separator className="my-6" />

                <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total Price</span>
                    <span>Ksh {totalPrice.toFixed(2)}</span>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-col gap-3">
                  <Button
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={!selectedSize}
                  >
                    Add to Bag
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleBuyNow}
                    disabled={!selectedSize}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4"/> Buy Now
                  </Button>
                </div>
                 <div className="mt-4 text-center text-sm text-muted-foreground">
                    <p>Promo codes can be applied at checkout.</p>
                </div>

                {/* Accordion for details */}
                <Accordion type="single" collapsible className="w-full mt-8">
                  <AccordionItem value="how-to-use">
                    <AccordionTrigger>How to Use</AccordionTrigger>
                    <AccordionContent>
                      <p className="whitespace-pre-wrap text-muted-foreground">{product.howToUse}</p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="ingredients">
                    <AccordionTrigger>Key Ingredients</AccordionTrigger>
                    <AccordionContent>
                       <p className="whitespace-pre-wrap text-muted-foreground">{product.ingredients}</p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="fragrance-notes">
                    <AccordionTrigger>Fragrance Notes</AccordionTrigger>
                    <AccordionContent>
                       <p className="whitespace-pre-wrap text-muted-foreground">{product.fragranceNotes}</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </>
            ) : (
              <div className="mt-8">
                <p className="mt-6 text-xl font-semibold text-foreground">
                  Pricing coming soon. Please contact us for details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

       {/* Related Products */}
       {relatedProducts.length > 0 && (
          <div className="bg-card py-16 sm:py-24">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2 className="font-headline text-3xl font-bold tracking-tight text-center text-foreground sm:text-4xl">
                    You Might Also Like
                </h2>
                <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                    {relatedProducts.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            </div>
          </div>
       )}
    </div>
  );
}
