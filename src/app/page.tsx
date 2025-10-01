import HeroSection from '@/components/sections/hero-section';
import ProductShowcase from '@/components/sections/product-showcase';
import ParallaxSection from '@/components/sections/parallax-section';
import SustainabilityHighlight from '@/components/sections/sustainability-highlight';
import BlogSection from '@/components/sections/blog-section';
import { getProducts } from '@/lib/products';

export default async function Home() {
  const products = await getProducts();

  return (
    <>
      <HeroSection />

      <ParallaxSection imageId="parallax-laundry" />

      <ProductShowcase products={products} />

      <ParallaxSection imageId="parallax-kitchen" />

      <SustainabilityHighlight />

      <BlogSection />
    </>
  );
}
