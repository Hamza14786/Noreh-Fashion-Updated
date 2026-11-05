import { ShopClient } from '@/components/shop/shop-client';
import { getSaleProducts } from '@/lib/products';

export const metadata = {
  title: 'Sale',
  description: 'Shop the MAISON ÉLÉGANCE sale — up to 40% off selected styles. Limited time only.',
};

export default function SalePage() {
  const saleProducts = getSaleProducts();
  return (
    <ShopClient
      title="Sale"
      breadcrumb={[{ label: 'Sale', href: '/sale' }]}
      description="Up to 40% off selected styles. Refresh your wardrobe for less — but hurry, these pieces won't last long."
      products={saleProducts}
    />
  );
}
