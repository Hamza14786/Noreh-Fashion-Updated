import { ShopClient } from '@/components/shop/shop-client';
import { products } from '@/lib/products';

export const metadata = {
  title: 'Shop All',
  description: 'Browse our complete collection of premium women\'s fashion — dresses, tops, co-ord sets, abayas, shoes, handbags and more.',
};

export default function ShopPage() {
  return (
    <ShopClient
      title="Shop All"
      breadcrumb={[{ label: 'Shop', href: '/shop' }]}
      description="Discover our complete collection of premium women's fashion, crafted with the finest materials and designed for the modern woman."
      products={products}
    />
  );
}
