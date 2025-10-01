import { websiteImages } from './website-images';
import { productImages } from './product-images';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = [
    ...websiteImages,
    ...productImages,
];
