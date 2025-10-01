
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

const jsonFilePath = path.resolve(process.cwd(), 'src/lib/website-images.ts');

// This is a simplified and potentially unsafe way to write to the filesystem in a serverless environment.
// It's used here for demonstration purposes. A real application should use a database.
export async function POST(request: Request) {
  try {
    const { images: updatedImages }: { images: ImagePlaceholder[] } = await request.json();

    if (!updatedImages) {
      return NextResponse.json({ error: 'No images data provided.' }, { status: 400 });
    }

    // Reconstruct the TypeScript file content
    const fileContent = `import type { ImagePlaceholder } from './placeholder-images';

export const websiteImages: ImagePlaceholder[] = ${JSON.stringify(updatedImages, null, 4)};
`;

    await fs.writeFile(jsonFilePath, fileContent, 'utf-8');

    return NextResponse.json({ success: true, message: 'Website images updated.' });

  } catch (error) {
    console.error('Error updating website images file:', error);
    return NextResponse.json({ error: 'Failed to update website images.' }, { status: 500 });
  }
}
