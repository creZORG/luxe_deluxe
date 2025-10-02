import HeroSection from '@/components/sections/hero-section';
import ParallaxSection from '@/components/sections/parallax-section';
import SustainabilityHighlight from '@/components/sections/sustainability-highlight';
import BlogSection from '@/components/sections/blog-section';
import AboutSection from '@/components/sections/about-section';
import ProductShowcase from '@/components/sections/product-showcase';
import { getAllProducts } from '@/lib/products';

export default async function Home() {
  const products = await getAllProducts();
  return (
    <>
      <HeroSection />
      
      <AboutSection />

      <ParallaxSection imageId="parallax-spa-bathroom" />
      
      <ProductShowcase products={products.filter(p => p.category === 'Shower Gels')} />

      <SustainabilityHighlight />
      
      <ParallaxSection imageId="parallax-kitchen" />

      <ProductShowcase products={products.filter(p => p.category === 'Dishwash' || p.category === 'Fabric Softeners')} />

      <BlogSection />
    </>
  );
}
