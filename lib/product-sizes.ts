import type { Product } from './types';

export const APPAREL_SIZES = ['S', 'M', 'L', 'XL'];
export const SHOE_SIZES = ['36', '37', '38', '39', '40', '41', '42'];

const apparelCategories = new Set([
  'lawn-suits', 'formal-wear', 'bridal-collection', 'pret-wear',
  'unstitched', 'abayas', 'khaddar',
]);

export function availableProductSizes(product: Pick<Product, 'category' | 'sizes'>) {
  const sizes = product.sizes || [];
  const legacyUnstitchedLabel = sizes.length === 1 && sizes[0].toLowerCase() === 'unstitched';
  if (sizes.length && !legacyUnstitchedLabel) return sizes;
  if (product.category === 'shoes') return SHOE_SIZES;
  if (apparelCategories.has(product.category)) return APPAREL_SIZES;
  return [];
}
