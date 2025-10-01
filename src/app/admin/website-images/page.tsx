
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Image from 'next/image';
import { websiteImages as initialWebsiteImages, ImagePlaceholder } from '@/lib/website-images';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Upload, Save, Loader2 } from 'lucide-react';

export default function WebsiteImagesPage() {
  const [images, setImages] = useState<ImagePlaceholder[]>(initialWebsiteImages);
  const [isPending, startTransition] = useTransition();
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, imageId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(imageId);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      const newUrl = result.secure_url;

      setImages(currentImages =>
        currentImages.map(img =>
          img.id === imageId ? { ...img, imageUrl: newUrl } : img
        )
      );

      toast({
        title: "Image Uploaded",
        description: `New image for "${imageId}" is ready to be saved.`,
      });

    } catch (error) {
      console.error(error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your image.",
        variant: "destructive",
      });
    } finally {
        setUploadingId(null);
    }
  };

  const handleSaveChanges = async () => {
    startTransition(async () => {
        try {
            const response = await fetch('/api/update-website-images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ images }),
            });

            if (!response.ok) throw new Error('Failed to save changes.');
            
            toast({
                title: "Changes Saved",
                description: "Your website images have been updated.",
            });

        } catch (error) {
            console.error(error);
            toast({
                title: "Save Failed",
                description: "Could not save image changes.",
                variant: "destructive",
            });
        }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Website Images</h1>
        <Button onClick={handleSaveChanges} disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save All Changes
        </Button>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Current Image</TableHead>
              <TableHead>Upload New</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {images.map((image) => (
              <TableRow key={image.id}>
                <TableCell className="font-medium">{image.id}</TableCell>
                <TableCell>{image.description}</TableCell>
                <TableCell>
                  <Image
                    alt={image.description}
                    className="aspect-video rounded-md object-cover"
                    height="72"
                    src={image.imageUrl}
                    width="128"
                    // Add a key to force re-render on URL change
                    key={image.imageUrl}
                  />
                </TableCell>
                <TableCell>
                  <label htmlFor={`upload-${image.id}`} className="cursor-pointer">
                    <Button asChild variant="outline" disabled={uploadingId === image.id}>
                      <div>
                        {uploadingId === image.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Upload className="mr-2 h-4 w-4" />
                        )}
                        Upload
                      </div>
                    </Button>
                    <Input
                      id={`upload-${image.id}`}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, image.id)}
                      disabled={uploadingId === image.id}
                    />
                  </label>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
