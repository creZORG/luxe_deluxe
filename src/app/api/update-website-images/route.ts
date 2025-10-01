
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { SiteContent } from '@/lib/site-content';

const jsonFilePath = path.resolve(process.cwd(), 'src/lib/site-content.ts');

export async function POST(request: Request) {
  try {
    const { content: updatedContent }: { content: SiteContent } = await request.json();

    if (!updatedContent) {
      return NextResponse.json({ error: 'No site content data provided.' }, { status: 400 });
    }

    const fileContent = `
import type { ImagePlaceholder } from './placeholder-images';

export type SocialLink = {
  platform: string;
  url: string;
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

export const siteContent: SiteContent = ${JSON.stringify(updatedContent, null, 2)};
`;

    await fs.writeFile(jsonFilePath, fileContent, 'utf-8');

    return NextResponse.json({ success: true, message: 'Site content updated.' });

  } catch (error) {
    console.error('Error updating site content file:', error);
    return NextResponse.json({ error: 'Failed to update site content.' }, { status: 500 });
  }
}
