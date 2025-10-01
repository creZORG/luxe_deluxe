
'use client';

import { useState, useMemo } from 'react';
import type { Product } from '@/lib/products';
import ProductCard from '@/components/product-card';
import { cn } from '@/lib/utils';

type Category = 'All' | 'Shower Gels' | 'Fabric Softeners' | 'Dishwash';

const categories: Category[] = ['All', 'Shower Gels', 'Fabric Softeners', 'Dishwash'];

type ProductShowcaseProps = {
  products: Product[];
}

export default function ProductShowcase({ products }: ProductShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') {
      return products;
    }
    return products.filter((product) => product.category === activeCategory);
  }, [products, activeCategory]);

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

        <div className="mt-12 flex justify-center">
          <div className="flex space-x-1 rounded-full bg-muted p-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  'rounded-full px-4 sm:px-6 py-2 text-sm sm:text-base font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  activeCategory === category
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-background/50'
                )}
              >
                {category}
              </button>
            ))}
          </div>
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
