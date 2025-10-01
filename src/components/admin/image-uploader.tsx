
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';

type ImageUploaderProps = {
  currentImageUrl?: string;
  onUploadSuccess: (url: string) => void;
};

export default function ImageUploader({ currentImageUrl, onUploadSuccess }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // To reset file input

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Set preview
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      const secureUrl = result.secure_url;

      if (!secureUrl) {
        throw new Error('Cloudinary URL not returned');
      }
      
      onUploadSuccess(secureUrl);
      setPreviewUrl(secureUrl);
      toast({
        title: 'Upload Successful',
        description: 'Image has been uploaded to Cloudinary.',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: 'Could not upload image. Please try again.',
        variant: 'destructive',
      });
      // Reset to original image on failure
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setIsUploading(false);
      // Reset file input to allow re-uploading the same file
      setFileInputKey(Date.now());
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-video rounded-md border border-dashed flex items-center justify-center bg-muted/40">
        {previewUrl ? (
          <Image src={previewUrl} alt="Image preview" layout="fill" className="object-contain rounded-md" />
        ) : (
          <div className="text-center text-muted-foreground">
            <ImageIcon className="mx-auto h-12 w-12" />
            <p>No image selected</p>
          </div>
        )}
         {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        )}
      </div>
       <label htmlFor={`image-upload-${fileInputKey}`} className="cursor-pointer w-full">
         <Button asChild variant="outline" className="w-full" disabled={isUploading}>
            <div>
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Choose Image'}
            </div>
         </Button>
         <Input
            id={`image-upload-${fileInputKey}`}
            key={fileInputKey}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
        />
       </label>
    </div>
  );
}

