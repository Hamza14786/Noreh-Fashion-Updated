import type { Product, Review } from './types';

const colors = {
  maroon: { name: 'Maroon', hex: '#741f35' },
  beige: { name: 'Beige', hex: '#d9c9a9' },
  coral: { name: 'Coral', hex: '#e98269' },
  magenta: { name: 'Magenta', hex: '#a81762' },
  navy: { name: 'Navy', hex: '#172644' },
  black: { name: 'Black', hex: '#171717' },
  pink: { name: 'Pink', hex: '#e7a9ba' },
  brown: { name: 'Brown', hex: '#4d3025' },
  purple: { name: 'Purple', hex: '#6655b5' },
  plum: { name: 'Plum', hex: '#84205b' },
  camel: { name: 'Camel', hex: '#a8783f' },
  darkGreen: { name: 'Dark Green', hex: '#17452b' },
  burgundy: { name: 'Burgundy', hex: '#6e1827' },
  mustard: { name: 'Mustard', hex: '#c28a12' },
  olive: { name: 'Olive', hex: '#56552a' },
  rust: { name: 'Rust', hex: '#a9472f' },
} as const;

const care =
  'Dry clean recommended. Or hand wash cold. Do not bleach. Hang dry. Iron on low heat.';
const shipping =
  'Free standard shipping on orders of PKR 5,000 or more. Cash on delivery available nationwide.';
const returns =
  'Free returns within 7 days. Items must be unworn with original tags and packaging attached.';

const productDetails = [
  { name: 'Embroidered Lawn Suit - Maroon', slug: 'embroidered-lawn-suit-maroon', image: 'suit-01.jpg', color: colors.maroon },
  { name: 'Embroidered Lawn Suit - Beige & Navy', slug: 'embroidered-lawn-suit-beige-navy', image: 'suit-02.jpg', color: colors.beige },
  { name: 'Printed Lawn Suit - Coral', slug: 'printed-lawn-suit-coral', image: 'suit-03.jpg', color: colors.coral },
  { name: 'Embroidered Lawn Suit - Magenta', slug: 'embroidered-lawn-suit-magenta', image: 'suit-04.jpg', color: colors.magenta },
  { name: 'Embroidered Lawn Suit - Navy', slug: 'embroidered-lawn-suit-navy', image: 'suit-05.jpg', color: colors.navy },
  { name: 'Embroidered Lawn Suit - Black', slug: 'embroidered-lawn-suit-black', image: 'suit-06.jpg', color: colors.black },
  { name: 'Printed Lawn Suit - Pink', slug: 'printed-lawn-suit-pink', image: 'suit-07.jpg', color: colors.pink },
  { name: 'Embroidered Lawn Suit - Brown', slug: 'embroidered-lawn-suit-brown', image: 'suit-08.jpg', color: colors.brown },
  { name: 'Embroidered Lawn Suit - Purple', slug: 'embroidered-lawn-suit-purple', image: 'suit-09.jpg', color: colors.purple },
  { name: 'Embroidered Lawn Suit - Plum', slug: 'embroidered-lawn-suit-plum', image: 'suit-10.jpg', color: colors.plum },
  { name: 'Embroidered Lawn Suit - Coral', slug: 'embroidered-lawn-suit-coral', image: 'suit-11.jpg', color: colors.coral },
  { name: 'Embroidered Lawn Suit - Camel', slug: 'embroidered-lawn-suit-camel', image: 'suit-12.jpg', color: colors.camel },
  { name: 'Printed Lawn Suit - Black', slug: 'printed-lawn-suit-black', image: 'suit-13.jpg', color: colors.black },
  { name: 'Printed Lawn Suit - Dark Green', slug: 'printed-lawn-suit-dark-green', image: 'suit-14.jpg', color: colors.darkGreen },
  { name: 'Embroidered Lawn Suit - Burgundy', slug: 'embroidered-lawn-suit-burgundy', image: 'suit-15.jpg', color: colors.burgundy },
  { name: 'Embroidered Lawn Suit - Camel & Black', slug: 'embroidered-lawn-suit-camel-black', image: 'suit-16.jpg', color: colors.camel },
  { name: 'Embroidered Lawn Suit - Mustard', slug: 'embroidered-lawn-suit-mustard', image: 'suit-17.jpg', color: colors.mustard },
  { name: 'Embroidered Lawn Suit - Olive', slug: 'embroidered-lawn-suit-olive', image: 'suit-18.jpg', color: colors.olive },
  { name: 'Embroidered Lawn Suit - Brown', slug: 'embroidered-lawn-suit-brown-floral', image: 'suit-19.jpg', color: colors.brown },
  { name: 'Embroidered Lawn Suit - Rust', slug: 'embroidered-lawn-suit-rust', image: 'suit-20.jpg', color: colors.rust },
] as const;

const productDescription = `Unstitched 3-piece suit
Fabric:  Dhanak
Embroidered Front & Sleeves
Plain Dyed Back & trouser 
Embroidered Shawl.
Delivery in 3-5 days`;

const sampleCustomerReviews = [
  {
    author: 'Ayesha Khan',
    rating: 5,
    date: 'October 15, 2026',
    title: 'Outstanding quality and fabric!',
    comment: 'The Dhanak fabric is exceptionally soft and warm. Embroidery is neat and looks even better in person.',
  },
  {
    author: 'Sana Tariq',
    rating: 5,
    date: 'October 18, 2026',
    title: 'Highly Recommended!',
    comment: 'Fast delivery and premium packaging. Exactly what I was looking for. Will definitely order again!',
  },
  {
    author: 'Hira Ahmed',
    rating: 5,
    date: 'October 20, 2026',
    title: 'Beautiful color and elegant embroidery',
    comment: 'The colors are vibrant and true to the pictures. Excellent fabric quality and lovely shawl.',
  },
  {
    author: 'Mariam Farooq',
    rating: 5,
    date: 'October 22, 2026',
    title: 'Worth every rupee',
    comment: 'Loved the fabric texture and elegant embroidery details. Perfect for winter wear.',
  },
  {
    author: 'Zainab Siddiqui',
    rating: 5,
    date: 'October 24, 2026',
    title: 'Super fast delivery and premium look',
    comment: 'The suit exceeded my expectations. Elegant cut, soft material, and exquisite finish!',
  },
  {
    author: 'Fatima Noor',
    rating: 5,
    date: 'October 26, 2026',
    title: 'Flawless stitching and design',
    comment: '10/10 quality. Very satisfied with my purchase. Will order more colors for sure.',
  },
];

function getSampleReviews(index: number, productName: string): Review[] {
  return [0, 1, 2].map((offset) => {
    const rev = sampleCustomerReviews[(index * 2 + offset) % sampleCustomerReviews.length];
    return {
      id: `rev-${index + 1}-${offset + 1}`,
      author: rev.author,
      rating: 5,
      date: rev.date,
      title: rev.title,
      comment: rev.comment,
      productName,
    };
  });
}

export const products: Product[] = productDetails.map((detail, index) => ({
  id: `p${index + 1}`,
  name: detail.name,
  slug: detail.slug,
  description: productDescription,
  category: 'lawn-suits',
  gender: 'women',
  collection: 'the-edit',
  brand: 'Noreh.pk',
  price: 4500,
  images: [`/products/${detail.image}`],
  colors: [detail.color],
  sizes: ['Unstitched'],
  stock: 10,
  sku: `NR-${String(index + 1).padStart(4, '0')}`,
  rating: 5,
  reviewCount: 3,
  reviews: getSampleReviews(index, detail.name),
  tags: ['dhanak', '3-piece', 'unstitched', detail.color.name.toLowerCase()],
  featured: true,
  isNewArrival: true,
  isBestSeller: false,
  material: 'Dhanak',
  careInstructions: care,
  shippingInfo: shipping,
  returnPolicy: returns,
}));

export const productMap = Object.fromEntries(
  products.map((product) => [product.slug, product])
) as Record<string, Product>;

export function getProductBySlug(slug: string): Product | undefined {
  if (!slug) return undefined;
  const decoded = decodeURIComponent(slug).trim().toLowerCase();
  const normalized = decoded.replace(/\s+/g, '-');
  return (
    productMap[slug] ||
    productMap[decoded] ||
    productMap[normalized] ||
    products.find(
      (p) =>
        p.slug.toLowerCase() === decoded ||
        p.slug.toLowerCase() === normalized ||
        p.name.toLowerCase() === decoded ||
        p.name.toLowerCase().replace(/\s+/g, '-') === normalized
    )
  );
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((product) => product.category === category);
}

export function getNewArrivals(): Product[] {
  return products.filter((product) => product.isNewArrival);
}

export function getBestSellers(): Product[] {
  return products.filter((product) => product.isBestSeller);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((product) => product.featured);
}

export function getSaleProducts(): Product[] {
  return products.filter((product) => product.salePrice !== undefined);
}

export function getProductsByCollection(collectionSlug: string): Product[] {
  return products.filter((product) => product.collection === collectionSlug);
}

export function searchProducts(query: string): Product[] {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return [];
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
  );
}

export const popularSearches = [
  'Lawn Suit',
  'Embroidered Suit',
  'Printed Suit',
];

export const heroImages = {
  banner: '/hero-banner.jpg',
  primary: '/products/suit-01.jpg',
  secondary: '/products/suit-02.jpg',
  editorial: '/products/suit-03.jpg',
};

export const editorialImages = [
  '/products/suit-04.jpg',
  '/products/suit-05.jpg',
  '/products/suit-06.jpg',
];

export const legacyProductImageBySlug = Object.fromEntries(
  productDetails.map(detail => [detail.slug, `/products/${detail.image}`])
) as Record<string, string>;

export const socialImages = products.map((product) => product.images[0]);
export const allColors = Object.values(colors);
export const allSizes = ['Unstitched'];
export const allBrands = ['Noreh.pk'];
