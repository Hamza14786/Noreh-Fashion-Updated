import { ShopClient } from '@/components/shop/shop-client';
import { products } from '@/lib/products';

export const metadata = {
  title: 'New Arrivals',
  description: 'Shop the latest arrivals at MAISON ÉLÉGANCE — new dresses, tops, co-ord sets and more.',
};

export default function NewArrivalsPage() {
  const newProducts = products.filter((p) => p.isNewArrival);
  return (
    <ShopClient
      title="New Arrivals"
      breadcrumb={[{ label: 'New Arrivals', href: '/new-arrivals' }]}
      description="Be the first to wear our latest designs. Fresh arrivals every week — from everyday essentials to occasion-ready pieces."
      products={newProducts}
    />
  );
}
