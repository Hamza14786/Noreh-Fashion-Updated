import { ShopClient } from '@/components/shop/shop-client';
import { products } from '@/lib/products';

export const metadata = {
  title: 'Women',
  description: 'Shop premium women\'s fashion at MAISON ÉLÉGANCE — dresses, tops, co-ord sets, abayas, shoes, handbags and accessories.',
};

export default function WomenPage() {
  return (
    <ShopClient
      title="Women"
      breadcrumb={[{ label: 'Women', href: '/women' }]}
      description="Discover our complete women's collection — from everyday essentials to occasion-ready pieces, crafted with the finest materials."
      products={products}
    />
  );
}
