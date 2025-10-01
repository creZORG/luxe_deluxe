
'use client';

import { useState, useEffect, useTransition } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Product } from '@/lib/products';
import { getProductById, getProducts, incrementProductView, submitProductRating } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { toast } from '@/hooks/use-toast';
import { Check, Star, Loader2 } from 'lucide-react';
import ProductCard from '@/components/product-card';
import { PremiumSkeleton } from '@/components/ui/premium-skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { getOrdersByUserId } from '@/lib/admin';

type ProductPageProps = {
  params: {
    id: string;
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
  const { user } = useAuth();
  const [hasPurchased, setHasPurchased] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [isSubmittingRating, startRatingSubmission] = useTransition();

  const fetchProductData = async () => {
    setLoading(true);
    incrementProductView(params.id);
    const fetchedProduct = await getProductById(params.id);

    if (fetchedProduct) {
      setProduct(fetchedProduct);
      if (user) {
        const orders = await getOrdersByUserId(user.uid);
        const purchased = orders.some(order => order.items.some(item => item.productId === fetchedProduct.id));
        setHasPurchased(purchased);

        const existingRating = fetchedProduct.ratings?.find(r => r.userId === user.uid);
        if (existingRating) {
            setUserRating(existingRating.rating);
        }
      }
      
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
  }, [params.id, user]);


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

  const handleRatingSubmit = (newRating: number) => {
      if (!user || !product) return;
      startRatingSubmission(async () => {
          const result = await submitProductRating(product.id, user.uid, newRating);
          if (result.success) {
              toast({ title: 'Rating Submitted', description: 'Thank you for your feedback!'});
              await fetchProductData(); // Re-fetch to update average rating
          } else {
              toast({ title: 'Error', description: result.error, variant: 'destructive' });
          }
      })
  }
  
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
          <div className="flex flex-col justify-center">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {product.name}
            </h1>
            
            {product.sizes && product.sizes.length > 0 && selectedSize ? (
              <>
                <p className="mt-6 text-2xl font-semibold text-foreground">
                  KES {selectedSize.price.toFixed(2)}
                </p>

                {/* Size Selector */}
                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-foreground">
                    Select Size
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <Button
                        key={size.size}
                        variant={selectedSize?.size === size.size ? 'default' : 'outline'}
                        onClick={() => setSelectedSize(size)}
                        className="min-w-[80px] rounded-full"
                      >
                        {size.size}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Add to Cart */}
                <div className="mt-8 flex gap-4">
                  <Button
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={!selectedSize}
                    className="flex-1"
                    variant="outline"
                  >
                    Add to Bag
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleBuyNow}
                    disabled={!selectedSize}
                    className="flex-1"
                  >
                    Buy Now
                  </Button>
                </div>
                 <div className="mt-4 text-center text-sm text-muted-foreground">
                    <p>Promo codes can be applied at checkout.</p>
                </div>
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

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="reviews">Ratings & Reviews ({product.reviewCount || 0})</TabsTrigger>
                </TabsList>
                <TabsContent value="description">
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-lg text-muted-foreground whitespace-pre-wrap">
                                {product.longDescription}
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="reviews">
                     <Card>
                        <CardHeader>
                            <CardTitle>Customer Reviews</CardTitle>
                            <div className="flex items-center gap-4 mt-2">
                                <StarRating rating={product.averageRating || 0} disabled />
                                <p className="text-muted-foreground">
                                    {product.averageRating?.toFixed(1) || '0.0'} out of 5
                                    ({product.reviewCount || 0} ratings)
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {user ? (
                                hasPurchased ? (
                                    <div className="space-y-2">
                                        <h3 className="font-semibold">
                                            {userRating > 0 ? 'Update your rating' : 'Rate this product'}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <StarRating rating={userRating} onRatingChange={handleRatingSubmit} disabled={isSubmittingRating} />
                                            {isSubmittingRating && <Loader2 className="h-5 w-5 animate-spin" />}
                                        </div>
                                        <p className="text-xs text-muted-foreground">You can rate this product because you've purchased it.</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">You must purchase this product to leave a review.</p>
                                )
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    <Link href="/login" className="underline">Log in</Link> to rate products you've purchased.
                                </p>
                            )}

                            <div className="mt-8">
                                <h3 className="font-semibold mb-4">All Reviews</h3>
                                <p className="text-sm text-muted-foreground">Review display is coming soon!</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
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
