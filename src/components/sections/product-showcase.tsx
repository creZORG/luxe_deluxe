'use client';

import { useState } from 'react';
import { products, Product } from '@/lib/products';
import ProductCard from '@/components/product-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Citrus, Flower2, Wind, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

type Category = 'Shower Gels' | 'Fabric Softeners' | 'Dishwash';
type Fragrance = 'Lavender' | 'Citrus' | 'Fresh Cotton' | 'Rose' | 'Mint' | 'All';

const fragrances: { name: Fragrance, icon: React.ElementType }[] = [
  { name: 'Lavender', icon: Flower2 },
  { name: 'Citrus', icon: Citrus },
  { name: 'Fresh Cotton', icon: Wind },
  { name: 'Rose', icon: Flower2 },
  { name: 'Mint', icon: Citrus },
];

const availableFragrancesForCategory = (category: Category): Fragrance[] => {
    const categoryProducts = products.filter(p => p.category === category);
    const uniqueFragrances = [...new Set(categoryProducts.map(p => p.fragrance))];
    return uniqueFragrances as Fragrance[];
}


export default function ProductShowcase() {
  const [activeCategory, setActiveCategory] = useState<Category>('Shower Gels');
  const [activeFilter, setActiveFilter] = useState<Fragrance>('All');

  const handleCategoryChange = (value: string) => {
    setActiveCategory(value as Category);
    setActiveFilter('All');
  };

  const filteredProducts = products.filter(
    (product) =>
      product.category === activeCategory &&
      (activeFilter === 'All' || product.fragrance === activeFilter)
  );
  
  const currentFragrances = availableFragrancesForCategory(activeCategory);

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

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
             <Button variant={activeFilter === 'All' ? 'default' : 'ghost'} onClick={() => setActiveFilter('All')} className="rounded-full gap-2">
                <Filter className="h-4 w-4" /> All
             </Button>
            {currentFragrances.map((fragranceName) => {
                const fragranceInfo = fragrances.find(f => f.name === fragranceName);
                if (!fragranceInfo) return null;
                return (
                    <Button
                        key={fragranceName}
                        variant={activeFilter === fragranceName ? 'default' : 'ghost'}
                        onClick={() => setActiveFilter(fragranceName)}
                        className={cn("rounded-full gap-2")}
                    >
                        <fragranceInfo.icon className="h-4 w-4" />
                        {fragranceName}
                    </Button>
                );
            })}
          </div>

          <TabsContent value={activeCategory} className="mt-10">
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
