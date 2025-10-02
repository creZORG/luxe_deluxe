
'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { unstable_noStore as noStore } from 'next/cache';
import { revalidatePath } from 'next/cache';
import { migrateContent } from './content-migration';

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
// If it doesn't exist, it runs the migration to create it from the old static file.
export async function getSiteContent(): Promise<SiteContent> {
  noStore();
  try {
    const contentRef = doc(db, 'content', CONTENT_DOC_ID);
    let contentSnap = await getDoc(contentRef);

    if (!contentSnap.exists()) {
      console.log('No site content found in Firestore. Running initial migration...');
      await migrateContent();
      // Re-fetch after migration
      contentSnap = await getDoc(contentRef);
      if (!contentSnap.exists()) {
        throw new Error("Migration failed, content document still not found.");
      }
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
