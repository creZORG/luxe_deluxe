'use client';

import { useState } from 'react';
import { products, Product } from '@/lib/products';
import ProductCard from '@/components/product-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Category = 'Shower Gels' | 'Fabric Softeners' | 'Dishwash';

export default function ProductShowcase() {
  const [activeCategory, setActiveCategory] = useState<Category>('Shower Gels');

  const handleCategoryChange = (value: string) => {
    setActiveCategory(value as Category);
  };

  const filteredProducts = products.filter(
    (product) => product.category === activeCategory
  );

  return (
    <section id="products" className="py-16 sm:py-24 bg-card">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Our Collections
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Discover our range of meticulously crafted essentials, designed to bring a touch of luxury to your daily routine.
          </p>
        </div>

        <Tabs defaultValue="Shower Gels" className="mt-12" onValueChange={handleCategoryChange}>
          <TabsList className="grid w-full grid-cols-3 bg-background">
            <TabsTrigger value="Shower Gels">Shower Gels</TabsTrigger>
            <TabsTrigger value="Fabric Softeners">Fabric Softeners</TabsTrigger>
            <TabsTrigger value="Dishwash">Dishwash</TabsTrigger>
          </TabsList>

          <TabsContent value={activeCategory} className="mt-10">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found for this category.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
