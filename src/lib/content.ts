
'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { unstable_noStore as noStore } from 'next/cache';
import { revalidatePath } from 'next/cache';

export type SocialLink = {
  platform: string;
  url: string;
};

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export type BlogPostContent = {
    id: number;
    title: string;
    imageId: string;
    excerpt: string;
}

export type SiteContent = {
  collectionFabricSoftenersImageId: string;
  collectionShowerGelsImageId: string;
  collectionDishwashImageId: string;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  socialMedia: SocialLink[];
  images: ImagePlaceholder[];
  blogPosts: BlogPostContent[];
};

const CONTENT_DOC_ID = 'main';

// This function gets the site content from Firestore.
// If it doesn't exist, it returns a default empty structure.
export async function getSiteContent(): Promise<SiteContent> {
  noStore();
  try {
    const contentRef = doc(db, 'content', CONTENT_DOC_ID);
    let contentSnap = await getDoc(contentRef);

    if (!contentSnap.exists()) {
      console.log('No site content document found. Returning default structure. Please populate content in /admin/site-content.');
      // Return a default, empty structure if the document doesn't exist.
      const defaultContent: SiteContent = {
          collectionFabricSoftenersImageId: 'collection-fabric-softener-default',
          collectionShowerGelsImageId: 'collection-shower-gel-default',
          collectionDishwashImageId: 'collection-dishwash-default',
          contact: { email: 'your-email@example.com', phone: 'Your Phone', address: 'Your Address' },
          socialMedia: [{ platform: 'Instagram', url: '#' }],
          images: [
              { id: 'collection-fabric-softener-default', description: 'A stack of fresh, clean laundry', imageUrl: 'https://i.postimg.cc/tJn5gJ2D/fresh-laundry.jpg', imageHint: 'laundry' },
              { id: 'collection-shower-gel-default', description: 'A luxurious spa-like bathroom with glowing shower gel', imageUrl: 'https://i.postimg.cc/D0pypW2T/glowing-shower-gel.jpg', imageHint: 'spa bathroom' },
              { id: 'collection-dishwash-default', description: 'Sparkling clean dishes in a modern kitchen', imageUrl: 'https://i.postimg.cc/bN9b9zL1/sparkling-dishes.jpg', imageHint: 'clean kitchen' },
              { id: 'sustainability-banner', description: 'Nature-inspired photography of water ripples', imageUrl: 'https://i.postimg.cc/sXvLpLJM/water-ripples.jpg', imageHint: 'water ripples' },
              { id: 'blog-spa-home', description: 'A woman relaxing in a home spa setting', imageUrl: 'https://placehold.co/600x400', imageHint: 'spa home' },
              { id: 'blog-laundry-tips', description: 'Aesthetically pleasing laundry room', imageUrl: 'https://placehold.co/600x400', imageHint: 'laundry room' },
              { id: 'blog-kitchen-organizing', description: 'A beautifully organized modern kitchen', imageUrl: 'https://placehold.co/600x400', imageHint: 'clean kitchen' },
              { id: 'about-us-image', description: 'Image for About Us section', imageUrl: 'https://i.postimg.cc/YSj7k0wM/production-process.jpg', imageHint: 'natural ingredients' },
              { id: 'sustainability-image', description: 'Image for Sustainability section', imageUrl: 'https://i.postimg.cc/PqY7d7WJ/eco-friendly-packaging.jpg', imageHint: 'eco friendly' },
          ],
          blogPosts: [
              { id: 1, title: 'How to Create a Spa Experience at Home', imageId: 'blog-spa-home', excerpt: 'Transform your bathroom into a sanctuary of relaxation with our expert tips and luxurious essentials.' },
              { id: 2, title: 'The Secret to Everlasting Softness', imageId: 'blog-laundry-tips', excerpt: 'Learn the art of laundry care to keep your fabrics feeling brand new, wash after wash.' },
              { id: 3, title: 'Effortless Elegance in the Kitchen', imageId: 'blog-kitchen-organizing', excerpt: 'Discover how our dishwash solutions can bring a sparkle to your kitchen and simplify your daily routine.' },
          ]
      };
      // Optionally create the document with default content for the admin to edit
      await setDoc(contentRef, defaultContent);
      return defaultContent;
    }

    const data = contentSnap.data() as SiteContent;
    
    // Ensure essential fields have fallback values to prevent crashes
    if (!data.images) data.images = [];
    if (!data.blogPosts) data.blogPosts = [];
    if (!data.contact) data.contact = { email: '', phone: '', address: '' };
    if (!data.socialMedia) data.socialMedia = [];
    
    // Fallbacks for new image IDs
    if (!data.collectionFabricSoftenersImageId) data.collectionFabricSoftenersImageId = 'collection-fabric-softener-default';
    if (!data.collectionShowerGelsImageId) data.collectionShowerGelsImageId = 'collection-shower-gel-default';
    if (!data.collectionDishwashImageId) data.collectionDishwashImageId = 'collection-dishwash-default';


    return data;

  } catch (error) {
    console.error("Error fetching site content from Firestore: ", error);
    // As a fallback, return an empty structure to prevent crashes.
    return {
        collectionFabricSoftenersImageId: 'collection-fabric-softener-default',
        collectionShowerGelsImageId: 'collection-shower-gel-default',
        collectionDishwashImageId: 'collection-dishwash-default',
        contact: { email: '', phone: '', address: ''},
        socialMedia: [],
        images: [],
        blogPosts: []
    }
  }
}

// This function updates the site content in Firestore.
export async function updateSiteContent(content: SiteContent): Promise<{success: boolean, error?: string}> {
    try {
        const contentRef = doc(db, 'content', CONTENT_DOC_ID);
        await setDoc(contentRef, content, { merge: true });

        // Revalidate paths that use site content
        revalidatePath('/', 'layout');
        revalidatePath('/admin/site-content');

        return { success: true };
    } catch (error) {
        console.error("Error updating site content in Firestore:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Failed to update content in database: ${errorMessage}` };
    }
}
