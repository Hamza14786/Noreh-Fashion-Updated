import { ShopClient } from '@/components/shop/shop-client';
import { products } from '@/lib/products';

export const metadata = {
  title: 'Kids',
  description: 'Shop premium kids\' fashion at MAISON ÉLÉGANCE.',
};

export default function KidsPage() {
  return (
    <ShopClient
      title="Kids"
      breadcrumb={[{ label: 'Kids', href: '/kids' }]}
      description="Our kids' collection is coming soon. In the meantime, explore our women's collection."
      products={products.filter((p) => p.gender === 'kids')}
    />
  );
}
