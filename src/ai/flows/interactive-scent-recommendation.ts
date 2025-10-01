'use server';
/**
 * @fileOverview This file defines a Genkit flow for providing personalized fragrance recommendations based on user input.
 *
 * It includes:
 * - `getScentRecommendation` - A function that takes user mood and preferences as input and returns fragrance recommendations.
 * - `ScentRecommendationInput` - The input type for the `getScentRecommendation` function.
 * - `ScentRecommendationOutput` - The output type for the `getScentRecommendation` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScentRecommendationInputSchema = z.object({
  mood: z
    .string()
    .describe('The user\'s current mood (e.g., happy, relaxed, stressed).'),
  preferences: z
    .string()
    .describe(
      'The user\'s general fragrance preferences (e.g., floral, citrus, woody).'
    ),
});
export type ScentRecommendationInput = z.infer<typeof ScentRecommendationInputSchema>;

const ScentRecommendationOutputSchema = z.object({
  recommendation: z
    .string()
    .describe(
      'A personalized fragrance recommendation based on the user\'s mood and preferences.'
    ),
});
export type ScentRecommendationOutput = z.infer<typeof ScentRecommendationOutputSchema>;

export async function getScentRecommendation(
  input: ScentRecommendationInput
): Promise<ScentRecommendationOutput> {
  return scentRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scentRecommendationPrompt',
  input: {schema: ScentRecommendationInputSchema},
  output: {schema: ScentRecommendationOutputSchema},
  prompt: `You are a fragrance expert who provides personalized recommendations based on a user's mood and preferences.

  Mood: {{{mood}}}
  Preferences: {{{preferences}}}

  Based on the mood and preferences, recommend a fragrance from Luna and provide a brief description of why it is suitable.`,
});

const scentRecommendationFlow = ai.defineFlow(
  {
    name: 'scentRecommendationFlow',
    inputSchema: ScentRecommendationInputSchema,
    outputSchema: ScentRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
