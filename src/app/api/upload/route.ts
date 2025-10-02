
import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const results = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                // Optionally add upload presets, tags, etc.
                folder: 'luna-app',
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            }
        ).end(buffer);
    });

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error uploading to Cloudinary:', error);
    const errorMessage = error.message || 'Something went wrong during the upload.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
