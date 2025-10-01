'use server';
/**
 * @fileOverview A flow to handle user creation in Firestore after signup.
 *
 * - userSignupFlow - Creates a user document in Firestore.
 * - UserSignupInput - The input type for the userSignupFlow.
 */

import { ai } from '@/ai/genkit';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { z } from 'zod';

export const UserSignupInputSchema = z.object({
  uid: z.string(),
  name: z.string(),
  email: z.string(),
});

export type UserSignupInput = z.infer<typeof UserSignupInputSchema>;

export const userSignupFlow = ai.defineFlow(
  {
    name: 'userSignupFlow',
    inputSchema: UserSignupInputSchema,
    outputSchema: z.object({ success: z.boolean(), message: z.string().optional() }),
  },
  async (input) => {
    try {
      const { uid, name, email } = input;

      if (!uid || !name || !email) {
        return { success: false, message: 'Missing required fields.' };
      }

      await adminDb.collection('users').doc(uid).set({
        name,
        email,
        role: 'customer',
        signupDate: new Date(),
      });
      
      // We are not handling email sending in this flow for now.
      
      return { success: true };

    } catch (error) {
      console.error('Error in userSignupFlow:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      return { success: false, message: `Error creating user document: ${errorMessage}` };
    }
  }
);
