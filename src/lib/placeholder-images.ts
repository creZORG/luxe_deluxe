
import { websiteImages } from './website-images';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// productImages are now managed via upload, so we only need website images here.
export const PlaceHolderImages: ImagePlaceholder[] = [
    ...websiteImages,
];
