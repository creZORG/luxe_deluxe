import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    title: 'How to Create a Spa Experience at Home',
    imageId: 'blog-spa-home',
    excerpt: 'Transform your bathroom into a sanctuary of relaxation with our expert tips and luxurious essentials.',
  },
  {
    id: 2,
    title: 'The Secret to Everlasting Softness',
    imageId: 'blog-laundry-tips',
    excerpt: 'Learn the art of laundry care to keep your fabrics feeling brand new, wash after wash.',
  },
  {
    id: 3,
    title: 'Effortless Elegance in the Kitchen',
    imageId: 'blog-kitchen-organizing',
    excerpt: 'Discover how our dishwash solutions can bring a sparkle to your kitchen and simplify your daily routine.',
  },
];

export default function BlogSection() {
  return (
    <section id="about" className="py-16 sm:py-24 bg-card">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            The Luxe Lifestyle
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Inspiration for a more beautiful and mindful life, from our home to yours.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => {
            const image = PlaceHolderImages.find((img) => img.id === post.imageId);
            return (
              <Link href="#" key={post.id} className="group block">
                <Card className="h-full overflow-hidden transition-shadow duration-300 hover:shadow-xl">
                  {image && (
                    <CardHeader className="p-0">
                      <div className="relative aspect-video w-full overflow-hidden">
                        <Image
                          src={image.imageUrl}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          data-ai-hint={image.imageHint}
                        />
                      </div>
                    </CardHeader>
                  )}
                  <CardContent className="p-6">
                    <CardTitle className="font-headline text-xl font-semibold">
                      {post.title}
                    </CardTitle>
                    <p className="mt-2 text-muted-foreground">{post.excerpt}</p>
                    <div className="mt-4 flex items-center font-semibold text-primary">
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
