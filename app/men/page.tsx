import { ShopClient } from '@/components/shop/shop-client';
import { products } from '@/lib/products';

export const metadata = {
  title: 'Men',
  description: 'Shop premium men\'s fashion at MAISON ÉLÉGANCE.',
};

export default function MenPage() {
  return (
    <ShopClient
      title="Men"
      breadcrumb={[{ label: 'Men', href: '/men' }]}
      description="Our men's collection is coming soon. In the meantime, explore our women's collection."
      products={products.filter((p) => p.gender === 'men')}
    />
  );
}
