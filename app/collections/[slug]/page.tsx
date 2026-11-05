import Link from 'next/link';
import { notFound } from 'next/navigation';
import { collections, collectionMap } from '@/lib/categories';
import { getProductsByCollection } from '@/lib/products';
import { ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';

export function generateStaticParams() {
  return collections.map((col) => ({ slug: col.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const {slug}=await params;
  const collection = collectionMap[slug];
  if (!collection) return { title: 'Collection Not Found' };
  return {
    title: collection.name,
    description: collection.description,
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const {slug}=await params;
  const collection = collectionMap[slug];
  if (!collection) notFound();
  const products = getProductsByCollection(slug);

  return (
    <div>
      {/* Hero banner */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={collection.image}
          alt={collection.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative h-full flex items-center justify-center text-center text-white px-4">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase opacity-80 mb-3">
              {collection.season}
            </p>
            <h1 className="font-display text-4xl md:text-6xl mb-4">{collection.name}</h1>
            <p className="text-lg opacity-90 max-w-xl mx-auto">{collection.description}</p>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/collections" className="hover:text-foreground transition-colors">Collections</Link>
          <span>/</span>
          <span>{collection.name}</span>
        </nav>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="font-display text-2xl mb-2">No products in this collection yet</p>
            <p className="text-sm text-muted-foreground mb-6">Check back soon for new arrivals.</p>
            <Button asChild>
              <Link href="/shop">Browse All Products</Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
