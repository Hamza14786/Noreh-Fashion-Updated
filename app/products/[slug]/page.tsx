import { notFound } from 'next/navigation';
import { products, getProductBySlug } from '@/lib/products';
import { ProductDetailClient } from '@/components/product/product-detail-client';
import { initializeDatabase, pool, fromRow } from '@/lib/server/db';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const {slug}=await params;
  let product = getProductBySlug(slug);
  try { await initializeDatabase(); const result = await pool.query('SELECT * FROM products WHERE slug=$1', [slug]); if(result.rows[0]) product=fromRow(result.rows[0]); } catch {}
  if (!product) return { title: 'Product Not Found' };
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.images[0]],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const {slug}=await params;
  let product = getProductBySlug(slug);
  try { await initializeDatabase(); const result = await pool.query('SELECT * FROM products WHERE slug=$1', [slug]); if(result.rows[0]) product=fromRow(result.rows[0]); } catch {}
  if (!product) notFound();

  let related = products.filter((p) => p.category === product!.category && p.id !== product!.id).slice(0,4);
  try { await initializeDatabase(); const result=await pool.query('SELECT * FROM products WHERE category=$1 AND id<>$2 LIMIT 4',[product.category,product.id]); if(result.rows.length) related=result.rows.map(fromRow); } catch {}

  return <ProductDetailClient product={product} relatedProducts={related} />;
}
