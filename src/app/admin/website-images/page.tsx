'use client';

import { useState } from 'react';
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
import { Upload } from 'lucide-react';

export default function WebsiteImagesPage() {
  const [images, setImages] = useState<ImagePlaceholder[]>(initialWebsiteImages);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, imageId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newUrl = reader.result as string;
        setImages(currentImages =>
          currentImages.map(img =>
            img.id === imageId ? { ...img, imageUrl: newUrl } : img
          )
        );
        toast({
          title: "Image Updated",
          description: `The image for "${imageId}" has been updated locally.`,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Website Images</h1>
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
                  />
                </TableCell>
                <TableCell>
                  <label htmlFor={`upload-${image.id}`} className="cursor-pointer">
                    <Button asChild variant="outline">
                      <div>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </div>
                    </Button>
                    <Input
                      id={`upload-${image.id}`}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, image.id)}
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
