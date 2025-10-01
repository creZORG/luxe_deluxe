'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  getScentRecommendation,
  ScentRecommendationInput,
} from '@/ai/flows/interactive-scent-recommendation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';

const FormSchema = z.object({
  mood: z.string().min(2, {
    message: 'Please tell us a bit about your mood.',
  }),
  preferences: z.string().min(2, {
    message: 'Please describe your scent preferences.',
  }),
});

export default function FragranceMoodGuide() {
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      mood: '',
      preferences: '',
    },
  });

  const onSubmit: SubmitHandler<ScentRecommendationInput> = async (data) => {
    setIsLoading(true);
    setRecommendation(null);
    try {
      const result = await getScentRecommendation(data);
      setRecommendation(result.recommendation);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get recommendation. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="mood-guide" className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Find Your Perfect Scent
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Let our AI-powered guide match your mood and preferences to the perfect Luxe Daily fragrance.
          </p>
        </div>

        <Card className="mt-12 w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                <Wand2 className="h-6 w-6 text-accent-foreground" />
                Scent Recommender
            </CardTitle>
            <CardDescription>
                Describe your current mood and fragrance preferences below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="mood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Mood</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Relaxed, energetic, cozy" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="preferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scent Preferences</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., I love floral scents, something not too sweet."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Get Recommendation
                </Button>
              </form>
            </Form>

            {recommendation && (
              <div className="mt-8 rounded-lg border bg-accent/30 p-6">
                <h3 className="font-headline text-xl font-semibold text-foreground">
                  Our Recommendation For You
                </h3>
                <p className="mt-2 text-foreground/80">{recommendation}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
