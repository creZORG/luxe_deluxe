
import Image from 'next/image';
import { getSiteContent } from '@/lib/content';
import { Leaf, Recycle, Heart } from 'lucide-react';

export default async function SustainabilityHighlight() {
  const content = await getSiteContent();
  const image = content.images.find((img) => img.id === 'sustainability-image');

  const features = [
    {
      icon: Leaf,
      title: 'Plant-Derived Ingredients',
      description:
        'Our formulas are powered by nature, using effective, plant-based ingredients that are gentle on you and the environment.',
    },
    {
      icon: Recycle,
      title: 'Recyclable Packaging',
      description:
        'We are committed to reducing waste. All our bottles and containers are 100% recyclable, helping to keep our planet clean.',
    },
    {
      icon: Heart,
      title: 'Cruelty-Free Commitment',
      description:
        'We believe in kindness, not just to our customers, but to all living things. None of our products are ever tested on animals.',
    },
  ];

  return (
    <section id="sustainability" className="py-16 sm:py-24 bg-card">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Luxury That Doesn't Cost the Earth.
            </h2>
            <p className="max-w-2xl mx-auto lg:mx-0 text-lg text-muted-foreground">
              We are passionate about creating products that are both indulgent and responsible. Our commitment to sustainability is woven into every aspect of our brand, from sourcing ingredients to our packaging choices.
            </p>
            <div className="grid grid-cols-1 gap-8 pt-4 sm:grid-cols-1">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-1 text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative h-96 w-full lg:h-[32rem] rounded-lg overflow-hidden shadow-xl">
             {image && (
                <Image
                    src={image.imageUrl}
                    alt={image.description}
                    fill
                    className="object-cover"
                    data-ai-hint={image.imageHint}
                />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
