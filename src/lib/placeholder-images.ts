
import { siteContent } from './site-content';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// All images used for site layout are now managed in site-content.ts
export const PlaceHolderImages: ImagePlaceholder[] = [
    ...siteContent.images,
];
