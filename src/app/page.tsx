import HeroSection from '@/components/sections/hero-section';
import ParallaxSection from '@/components/sections/parallax-section';
import SustainabilityHighlight from '@/components/sections/sustainability-highlight';
import BlogSection from '@/components/sections/blog-section';

export default function Home() {
  return (
    <>
      <HeroSection />

      <ParallaxSection imageId="parallax-laundry" />

      <SustainabilityHighlight />

      <BlogSection />
    </>
  );
}
