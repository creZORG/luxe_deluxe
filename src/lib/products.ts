export type Product = {
  id: string;
  name: string;
  category: 'Shower Gels' | 'Fabric Softeners' | 'Dishwash';
  fragrance: 'Lavender' | 'Raspberry' | 'Cocoa Butter' | 'Lime' | 'Mint' | 'Lemon' | 'Ocean Breeze' | 'Vanilla' | 'Mango' | 'Apricot & Peach' | 'Citrus';
  sizes: { size: string; price: number }[];
  imageId: string;
  description: string;
};

export const products: Product[] = [
  {
    id: 'sg-lav',
    name: 'Laid Back Lavender Shower Gel',
    category: 'Shower Gels',
    fragrance: 'Lavender',
    sizes: [
      { size: '400ml', price: 20.99 },
      { size: '500ml', price: 24.99 },
      { size: '800ml', price: 34.99 },
    ],
    imageId: 'shower-gel-lavender',
    description: 'Unwind your senses with the soothing scent of wild lavender.',
  },
  {
    id: 'sg-rasp',
    name: 'Sweet Raspberry Shower Gel',
    category: 'Shower Gels',
    fragrance: 'Raspberry',
    sizes: [
      { size: '400ml', price: 20.99 },
      { size: '500ml', price: 24.99 },
      { size: '800ml', price: 34.99 },
    ],
    imageId: 'shower-gel-raspberry',
    description: 'A sweet and juicy raspberry scent to brighten your day.',
  },
  {
    id: 'sg-cocoa',
    name: 'Cocoa Butter Shower Gel',
    category: 'Shower Gels',
    fragrance: 'Cocoa Butter',
    sizes: [
      { size: '400ml', price: 20.99 },
      { size: '500ml', price: 24.99 },
      { size: '800ml', price: 34.99 },
    ],
    imageId: 'shower-gel-cocoa',
    description: 'Nourish your skin with the rich and creamy scent of cocoa butter.',
  },
  {
    id: 'sg-lime',
    name: 'Zingy Lime Shower Gel',
    category: 'Shower Gels',
    fragrance: 'Lime',
    sizes: [
      { size: '400ml', price: 20.99 },
      { size: '500ml', price: 24.99 },
      { size: '800ml', price: 34.99 },
    ],
    imageId: 'shower-gel-citrus',
    description: 'A sharp, zesty lime fragrance to awaken your senses.',
  },
  {
    id: 'sg-mint',
    name: 'Tingly Mint Shower Gel',
    category: 'Shower Gels',
    fragrance: 'Mint',
    sizes: [
      { size: '400ml', price: 20.99 },
      { size: '500ml', price: 24.99 },
      { size: '800ml', price: 34.99 },
    ],
    imageId: 'dishwash-mint',
    description: 'A cool and refreshing minty tingle to invigorate your body.',
  },
  {
    id: 'sg-lemon',
    name: 'Zesty Lemon Shower Gel',
    category: 'Shower Gels',
    fragrance: 'Lemon',
    sizes: [
      { size: '400ml', price: 20.99 },
      { size: '500ml', price: 24.99 },
      { size: '800ml', price: 34.99 },
    ],
    imageId: 'shower-gel-citrus',
    description: 'Bright and zesty lemon to leave you feeling refreshed.',
  },
  {
    id: 'sg-ocean',
    name: 'Ocean Breeze Shower Gel',
    category: 'Shower Gels',
    fragrance: 'Ocean Breeze',
    sizes: [
      { size: '400ml', price: 20.99 },
      { size: '500ml', price: 24.99 },
      { size: '800ml', price: 34.99 },
    ],
    imageId: 'shower-gel-ocean',
    description: 'A clean and crisp scent that reminds you of a fresh ocean breeze.',
  },
  {
    id: 'sg-vanilla',
    name: 'Creamy Vanilla Shower Gel',
    category: 'Shower Gels',
    fragrance: 'Vanilla',
    sizes: [
      { size: '400ml', price: 20.99 },
      { size: '500ml', price: 24.99 },
      { size: '800ml', price: 34.99 },
    ],
    imageId: 'shower-gel-vanilla',
    description: 'A warm and comforting creamy vanilla fragrance.',
  },
  {
    id: 'sg-mango',
    name: 'Juicy Mango Shower Gel',
    category: 'Shower Gels',
    fragrance: 'Mango',
    sizes: [
      { size: '400ml', price: 20.99 },
      { size: '500ml', price: 24.99 },
      { size: '800ml', price: 34.99 },
    ],
    imageId: 'shower-gel-mango',
    description: 'A burst of tropical mango to make you feel exotic.',
  },
  {
    id: 'fs-apricot',
    name: 'Apricot & Peach Fabric Softener',
    category: 'Fabric Softeners',
    fragrance: 'Apricot & Peach',
    sizes: [
      { size: '750ml', price: 28.99 },
    ],
    imageId: 'fabric-softener-apricot',
    description: 'Sweet apricot and peach notes for long-lasting freshness.',
  },
  {
    id: 'fs-cool-lav',
    name: 'Cool Lavender Fabric Softener',
    category: 'Fabric Softeners',
    fragrance: 'Lavender',
    sizes: [
      { size: '750ml', price: 28.99 },
    ],
    imageId: 'fabric-softener-cotton',
    description: 'A cool and calming lavender scent for your laundry.',
  },
  {
    id: 'dw-lime',
    name: 'Limeglow Dishwash',
    category: 'Dishwash',
    fragrance: 'Lime',
    sizes: [
      { size: '500ml', price: 19.99 },
    ],
    imageId: 'dishwash-citrus',
    description: 'Cuts through grease with the power of lime, leaving a brilliant shine.',
  },
  {
    id: 'dw-citrus',
    name: 'Citrus Bloom Dishwash',
    category: 'Dishwash',
    fragrance: 'Citrus',
    sizes: [
      { size: '500ml', price: 19.99 },
    ],
    imageId: 'dishwash-citrus',
    description: 'A refreshing citrus scent to invigorate your kitchen.',
  },
];
