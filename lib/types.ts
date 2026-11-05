export type Category =
  | 'lawn-suits'
  | 'formal-wear'
  | 'bridal-collection'
  | 'pret-wear'
  | 'unstitched'
  | 'abayas'
  | 'khaddar'
  | 'shoes'
  | 'handbags'
  | 'accessories';

export type Gender = 'women' | 'men' | 'kids';

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '36' | '37' | '38' | '39' | '40' | '41' | '42';

export interface ColorOption {
  name: string;
  hex: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  productName?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: Category;
  gender: Gender;
  collection: string;
  brand: string;
  price: number;
  salePrice?: number;
  images: string[];
  colors: ColorOption[];
  sizes: string[];
  stock: number;
  sku: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  tags: string[];
  featured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  material: string;
  careInstructions: string;
  shippingInfo: string;
  returnPolicy: string;
}

export interface CategoryInfo {
  slug: Category;
  name: string;
  description: string;
  image: string;
}

export interface CollectionInfo {
  slug: string;
  name: string;
  description: string;
  image: string;
  season: string;
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  stock: number;
}

export interface WishlistItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  image: string;
  addedAt: string;
}
