
'use server';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import type { SiteContent } from './content';

// This is the old static content that we will migrate from.
const oldStaticContent: SiteContent = {
  "contact": {
    "email": "info@luna.co.ke",
    "phone": "+254 712 345 678",
    "address": "123 Luna Lane, Nairobi, Kenya"
  },
  "socialMedia": [
    {
      "platform": "Instagram",
      "url": "#"
    },
    {
      "platform": "Twitter",
      "url": "#"
    },
    {
      "platform": "Youtube",
      "url": "#"
    }
  ],
  "images": [
    {
      "id": "hero-misty-bathroom",
      "description": "A model in a misty, spa-like bathroom",
      "imageUrl": "https://images.unsplash.com/photo-1596971040979-4ca69b8bd83f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxzcGElMjBiYXRocm9vbXxlbnwwfHx8fDE3NTkyMDA1MTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "spa bathroom"
    },
    {
      "id": "parallax-laundry",
      "description": "A folded stack of fresh laundry with fabric softener",
      "imageUrl": "https://images.unsplash.com/photo-1596433904747-e8b061219a71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxmb2xkZWQlMjBsYXVuZHJ5fGVufDB8fHx8MTc1OTMwODM4Nnww&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "folded laundry"
    },
    {
      "id": "parallax-kitchen",
      "description": "A glossy kitchen scene with sparkling dishes",
      "imageUrl": "https://images.unsplash.com/photo-1567767326925-e02047bf469d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMGtpdGNoZW58ZW58MHx8fHwxNzU5MjA5NDgxfDA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "clean kitchen"
    },
    {
      "id": "parallax-spa-bathroom",
      "description": "A spa-like bathroom scene with a glowing shower gel",
      "imageUrl": "https://images.unsplash.com/photo-1707910393318-8f97ea71736a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxzaG93ZXIlMjBnZWwlMjBiYXRocm9vbXxlbnwwfHx8fDE3NTkzMDgzODZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "shower gel bathroom"
    },
    {
      "id": "sustainability-banner",
      "description": "Nature-inspired photography of water ripples",
      "imageUrl": "https://images.unsplash.com/photo-1527904188605-3424bcc2d107?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHx3YXRlciUyMHJpcHBsZXN8ZW58MHx8fHwxNzU5MzA4Mzg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "water ripples"
    },
    {
      "id": "blog-spa-home",
      "description": "A woman relaxing in a home spa setting",
      "imageUrl": "https://images.unsplash.com/photo-1526944139247-8657f4a94da4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxsaWZlc3R5bGUlMjBob21lfGVufDB8fHx8MTc1OTMwODM4Nnww&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "lifestyle home"
    },
    {
      "id": "blog-laundry-tips",
      "description": "Aesthetically pleasing laundry room",
      "imageUrl": "https://images.unsplash.com/photo-1701421048900-e0adbde9b90c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxsYXVuZHJ5JTIwcm9vbXxlbnwwfHx8fDE3NTkzMDgzODd8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "laundry room"
    },
    {
      "id": "blog-kitchen-organizing",
      "description": "A beautifully organized modern kitchen",
      "imageUrl": "https://images.unsplash.com/photo-1676907225475-f9aea84435ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxvcmdhbml6ZWQlMjBraXRjaGVufGVufDB8fHx8MTc1OTMwODM4Nnww&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "organized kitchen"
    }
  ]
};

/**
 * Migrates the static site content from the old file-based system
 * into a single document in a 'content' collection in Firestore.
 * This is intended to be a one-time operation.
 */
export async function migrateContent() {
  try {
    const contentRef = doc(db, 'content', 'main');
    await setDoc(contentRef, oldStaticContent);
    console.log("Successfully migrated static content to Firestore.");
  } catch (error) {
    console.error("Error migrating content to Firestore: ", error);
    throw error; // Re-throw to be handled by the caller
  }
}
