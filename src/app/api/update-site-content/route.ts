
import { NextResponse } from 'next/server';
import { updateSiteContent, type SiteContent } from '@/lib/content';

export async function POST(request: Request) {
  try {
    const { content: updatedContent }: { content: SiteContent } = await request.json();

    if (!updatedContent) {
      return NextResponse.json({ error: 'No site content data provided.' }, { status: 400 });
    }

    const result = await updateSiteContent(updatedContent);

    if (!result.success) {
        throw new Error(result.error || 'Failed to save changes to Firestore.');
    }

    return NextResponse.json({ success: true, message: 'Site content updated.' });

  } catch (error) {
    console.error('Error in POST /api/update-site-content:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
