'use server';
/**
 * @fileOverview A flow to handle user creation in Firestore after signup.
 *
 * - userSignupFlow - Creates a user document in Firestore.
 * - UserSignupInput - The input type for the userSignupFlow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { adminDb } from '@/lib/firebase/firebase-admin';

export const UserSignupInputSchema = z.object({
  uid: z.string().describe("The user's unique ID from Firebase Auth."),
  name: z.string().describe("The user's full name."),
  email: z.string().email().describe("The user's email address."),
});
export type UserSignupInput = z.infer<typeof UserSignupInputSchema>;

export const userSignupFlow = ai.defineFlow(
  {
    name: 'userSignupFlow',
    inputSchema: UserSignupInputSchema,
    outputSchema: z.object({ success: z.boolean() }),
  },
  async (input) => {
    try {
      await adminDb.collection('users').doc(input.uid).set({
        name: input.name,
        email: input.email,
        role: 'customer', // Default role for new users
      });
      return { success: true };
    } catch (error) {
      console.error('Error creating user document:', error);
      // In a real app, you might want more sophisticated error handling
      return { success: false };
    }
  }
);
