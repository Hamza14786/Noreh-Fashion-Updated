import { notFound } from 'next/navigation';
import { ShopClient } from '@/components/shop/shop-client';
import { categories, categoryMap } from '@/lib/categories';
import { getProductsByCategory } from '@/lib/products';

export function generateStaticParams() {
  return categories.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const {slug}=await params;
  const category = categoryMap[slug];
  if (!category) return { title: 'Category Not Found' };
  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const {slug}=await params;
  const category = categoryMap[slug];
  if (!category) notFound();
  const products = getProductsByCategory(slug);

  return (
    <ShopClient
      title={category.name}
      breadcrumb={[{ label: category.name, href: `/category/${category.slug}` }]}
      description={category.description}
      products={products}
      initialCategory={slug}
    />
  );
}
