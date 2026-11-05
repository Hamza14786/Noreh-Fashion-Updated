import { ShopClient } from '@/components/shop/shop-client';
import { products } from '@/lib/products';

export const metadata = {
  title: 'Best Sellers',
  description: 'Shop our most loved pieces — the best sellers our customers can\'t stop buying.',
};

export default function BestSellersPage() {
  const bestSellers = products.filter((p) => p.isBestSeller);
  return (
    <ShopClient
      title="Best Sellers"
      breadcrumb={[{ label: 'Best Sellers', href: '/best-sellers' }]}
      description="Our most loved pieces, chosen by thousands of customers. Shop the favourites before they're gone."
      products={bestSellers}
    />
  );
}
