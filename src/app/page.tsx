import HeroSection from '@/components/sections/hero-section';
import ProductShowcase from '@/components/sections/product-showcase';
import ParallaxSection from '@/components/sections/parallax-section';
import SustainabilityHighlight from '@/components/sections/sustainability-highlight';
import BlogSection from '@/components/sections/blog-section';
import FragranceMoodGuide from '@/components/sections/fragrance-mood-guide';

export default function Home() {
  return (
    <>
      <HeroSection />

      <ParallaxSection imageId="parallax-laundry" />

      <ProductShowcase />

      <ParallaxSection imageId="parallax-kitchen" />

      <FragranceMoodGuide />
      
      <SustainabilityHighlight />

      <BlogSection />
    </>
  );
}
