
import ProductShowcase from '@/components/sections/product-showcase';
import { getProducts } from '@/lib/products';

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <div className="bg-background">
      <ProductShowcase products={products} />
    </div>
  );
}
