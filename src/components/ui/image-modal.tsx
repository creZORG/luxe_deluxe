
'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import Image from 'next/image';

type ImageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText: string;
};

export function ImageModal({ isOpen, onClose, imageUrl, altText }: ImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-2 sm:p-4">
        <div className="relative aspect-video w-full">
          <Image
            src={imageUrl}
            alt={altText}
            fill
            className="object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
