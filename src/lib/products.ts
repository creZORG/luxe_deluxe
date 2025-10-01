export type Product = {
  id: string;
  name: string;
  category: 'Shower Gels' | 'Fabric Softeners' | 'Dishwash';
  fragrance: 'Lavender' | 'Citrus' | 'Fresh Cotton' | 'Rose' | 'Mint';
  sizes: { size: string; price: number }[];
  imageId: string;
  description: string;
};

export const products: Product[] = [
  {
    id: 'sg-lav',
    name: 'Calming Lavender Shower Gel',
    category: 'Shower Gels',
    fragrance: 'Lavender',
    sizes: [
      { size: '40ml', price: 5.99 },
      { size: '500ml', price: 24.99 },
      { size: '800ml', price: 34.99 },
    ],
    imageId: 'shower-gel-lavender',
    description: 'Unwind your senses with the soothing scent of wild lavender.',
  },
  {
    id: 'sg-cit',
    name: 'Zesty Citrus Shower Gel',
    category: 'Shower Gels',
    fragrance: 'Citrus',
    sizes: [
      { size: '40ml', price: 5.99 },
      { size: '500ml', price: 24.99 },
      { size: '800ml', price: 34.99 },
    ],
    imageId: 'shower-gel-citrus',
    description: 'Energize your day with a burst of fresh citrus notes.',
  },
  {
    id: 'fs-cot',
    name: 'Soft Cotton Fabric Softener',
    category: 'Fabric Softeners',
    fragrance: 'Fresh Cotton',
    sizes: [
      { size: '40ml', price: 4.99 },
      { size: '500ml', price: 22.99 },
      { size: '800ml', price: 32.99 },
    ],
    imageId: 'fabric-softener-cotton',
    description: 'Wrap your laundry in the comforting scent of clean, fresh cotton.',
  },
  {
    id: 'fs-rose',
    name: 'Delicate Rose Fabric Softener',
    category: 'Fabric Softeners',
    fragrance: 'Rose',
    sizes: [
      { size: '40ml', price: 4.99 },
      { size: '500ml', price: 22.99 },
      { size: '800ml', price: 32.99 },
    ],
    imageId: 'fabric-softener-rose',
    description: 'A romantic and elegant floral scent for your finest fabrics.',
  },
  {
    id: 'dw-cit',
    name: 'Sparkling Citrus Dishwash',
    category: 'Dishwash',
    fragrance: 'Citrus',
    sizes: [
      { size: '40ml', price: 3.99 },
      { size: '500ml', price: 19.99 },
      { size: '800ml', price: 29.99 },
    ],
    imageId: 'dishwash-citrus',
    description: 'Cuts through grease with the power of citrus, leaving a brilliant shine.',
  },
  {
    id: 'dw-mint',
    name: 'Cool Mint Dishwash',
    category: 'Dishwash',
    fragrance: 'Mint',
    sizes: [
      { size: '40ml', price: 3.99 },
      { size: '500ml', price: 19.99 },
      { size: '800ml', price: 29.99 },
    ],
    imageId: 'dishwash-mint',
    description: 'A crisp and refreshing mint aroma to invigorate your kitchen.',
  },
];
