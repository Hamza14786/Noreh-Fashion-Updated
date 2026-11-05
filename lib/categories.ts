import type { CategoryInfo, CollectionInfo } from './types';

export const categories: CategoryInfo[] = [
  {
    slug: 'lawn-suits',
    name: 'Lawn Suits',
    description: 'Breathable printed and embroidered lawn suits for everyday elegance.',
    image: '/products/suit-01.jpg',
  },
  {
    slug: 'formal-wear',
    name: 'Formal Wear',
    description: 'Exquisitely crafted formal suits for weddings, parties, and special occasions.',
    image: '/products/suit-02.jpg',
  },
  {
    slug: 'bridal-collection',
    name: 'Bridal Collection',
    description: 'Heirloom-worthy bridal ensembles with intricate embroidery and rich fabrics.',
    image: '/products/suit-03.jpg',
  },
  {
    slug: 'pret-wear',
    name: 'Pret Wear',
    description: 'Ready-to-wear pieces designed for the modern woman on the go.',
    image: '/products/suit-04.jpg',
  },
  {
    slug: 'unstitched',
    name: 'Unstitched Fabric',
    description: 'Premium unstitched fabric — lawn, khaddar, and linen for custom tailoring.',
    image: '/products/suit-05.jpg',
  },
  {
    slug: 'abayas',
    name: 'Abayas & Modest Wear',
    description: 'Modest fashion reimagined with contemporary elegance and fine craftsmanship.',
    image: '/products/suit-06.jpg',
  },
  {
    slug: 'khaddar',
    name: 'Khaddar & Winter',
    description: 'Warm khaddar and winter suits for the cooler months.',
    image: '/products/suit-07.jpg',
  },
  {
    slug: 'shoes',
    name: 'Shoes & Khussa',
    description: 'Traditional khussa, heels, and flats crafted for comfort and style.',
    image: '/products/suit-08.jpg',
  },
  {
    slug: 'handbags',
    name: 'Handbags',
    description: 'Structured totes, elegant clutches, and everyday companions.',
    image: '/products/suit-09.jpg',
  },
  {
    slug: 'accessories',
    name: 'Jewellery & Accessories',
    description: 'Statement jewellery, earrings, and finishing touches that complete every look.',
    image: '/products/suit-10.jpg',
  },
];

export const collections: CollectionInfo[] = [
  {
    slug: 'winter-2026',
    name: 'Winter Collection 2026',
    description: 'Designed for the moments that matter — a collection of rich textures, warm tones, and timeless silhouettes crafted for the season ahead.',
    image: '/products/suit-11.jpg',
    season: 'Winter 2026',
  },
  {
    slug: 'the-edit',
    name: 'The Edit',
    description: 'A curated selection of our most coveted pieces — refined essentials and statement designs chosen by our styling team.',
    image: '/products/suit-12.jpg',
    season: 'Signature',
  },
  {
    slug: 'wedding-collection',
    name: 'Wedding Collection',
    description: 'For nights worth remembering. Luxurious fabrics, sculptural details, and silhouettes that command the room.',
    image: '/products/suit-13.jpg',
    season: 'Occasion',
  },
  {
    slug: 'modest-luxury',
    name: 'Modest Luxury',
    description: 'Where modesty meets modernity. Flowing fabrics, intricate embroidery, and designs that celebrate understated elegance.',
    image: '/products/suit-14.jpg',
    season: 'Heritage',
  },
];

export const categoryMap = Object.fromEntries(
  categories.map((c) => [c.slug, c])
) as Record<string, CategoryInfo>;

export const collectionMap = Object.fromEntries(
  collections.map((c) => [c.slug, c])
) as Record<string, CollectionInfo>;
