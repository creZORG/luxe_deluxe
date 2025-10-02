
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

export type SiteContent = {
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  socialMedia: SocialLink[];
  images: ImagePlaceholder[];
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
          contact: { email: 'your-email@example.com', phone: 'Your Phone', address: 'Your Address' },
          socialMedia: [{ platform: 'Instagram', url: '#' }],
          images: [
              { id: 'hero-misty-bathroom', description: 'Hero image for homepage', imageUrl: 'https://placehold.co/1920x1080', imageHint: 'bathroom scene' },
              { id: 'parallax-laundry', description: 'Parallax image for laundry section', imageUrl: 'https://placehold.co/1920x1080', imageHint: 'laundry' },
              { id: 'sustainability-banner', description: 'Banner for sustainability section', imageUrl: 'https://placehold.co/1920x500', imageHint: 'nature' },
              { id: 'blog-spa-home', description: 'Blog post image for spa at home', imageUrl: 'https://placehold.co/600x400', imageHint: 'spa home' },
              { id: 'blog-laundry-tips', description: 'Blog post image for laundry tips', imageUrl: 'https://placehold.co/600x400', imageHint: 'laundry room' },
              { id: 'blog-kitchen-organizing', description: 'Blog post image for kitchen organizing', imageUrl: 'https://placehold.co/600x400', imageHint: 'clean kitchen' },
          ]
      };
      // Optionally create the document with default content for the admin to edit
      await setDoc(contentRef, defaultContent);
      return defaultContent;
    }

    return contentSnap.data() as SiteContent;

  } catch (error) {
    console.error("Error fetching site content from Firestore: ", error);
    // As a fallback, return an empty structure to prevent crashes.
    return {
        contact: { email: '', phone: '', address: ''},
        socialMedia: [],
        images: []
    }
  }
}

// This function updates the site content in Firestore.
export async function updateSiteContent(content: SiteContent): Promise<{success: boolean, error?: string}> {
    try {
        const contentRef = doc(db, 'content', CONTENT_DOC_ID);
        await setDoc(contentRef, content);

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
