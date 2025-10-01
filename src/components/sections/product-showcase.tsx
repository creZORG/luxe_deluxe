'use client';

import { useState, useMemo } from 'react';
import type { Product } from '@/lib/products';
import ProductCard from '@/components/product-card';
import { Button } from '@/components/ui/button';

type Category = 'Shower Gels' | 'Fabric Softeners' | 'Dishwash';

const categories: Category[] = ['Shower Gels', 'Fabric Softeners', 'Dishwash'];

type ProductShowcaseProps = {
  products: Product[];
}

export default function ProductShowcase({ products }: ProductShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('Shower Gels');

  const filteredProducts = useMemo(() => products.filter(
    (product) => product.category === activeCategory
  ), [products, activeCategory]);

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

        <div className="mt-12 flex justify-center gap-4">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? 'default' : 'outline'}
              onClick={() => setActiveCategory(category)}
              className="rounded-full px-6 py-3 text-base"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="mt-10">
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
        </div>
      </div>
    </section>
  );
}
