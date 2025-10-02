import HeroSection from '@/components/sections/hero-section';
import ParallaxSection from '@/components/sections/parallax-section';
import SustainabilityHighlight from '@/components/sections/sustainability-highlight';
import BlogSection from '@/components/sections/blog-section';
import AboutSection from '@/components/sections/about-section';

export default async function Home() {
  return (
    <>
      <HeroSection />
      
      <AboutSection />

      <ParallaxSection imageId="parallax-spa-bathroom" />
      
      <SustainabilityHighlight />
      
      <ParallaxSection imageId="parallax-kitchen" />

      <BlogSection />
    </>
  );
}
