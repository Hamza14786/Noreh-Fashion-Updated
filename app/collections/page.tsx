import Link from 'next/link';
import { collections } from '@/lib/categories';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Collections',
  description: 'Explore all MAISON ÉLÉGANCE collections — seasonal edits, occasion wear, and signature pieces.',
};

export default function CollectionsPage() {
  return (
    <div className="container mx-auto px-4 lg:px-8 py-12">
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span>Collections</span>
      </nav>

      <div className="mb-12 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">Curated</p>
        <h1 className="font-display text-4xl md:text-5xl mb-3">Our Collections</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Each collection tells a story. Explore our seasonal edits and signature lines, crafted for the woman who dresses with intention.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {collections.map((col) => (
          <Link
            key={col.slug}
            href={`/collections/${col.slug}`}
            className="group relative overflow-hidden aspect-[4/5] bg-secondary"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={col.image}
              alt={col.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
              <p className="text-xs tracking-[0.2em] uppercase opacity-80 mb-2">{col.season}</p>
              <h2 className="font-display text-2xl md:text-3xl mb-2">{col.name}</h2>
              <p className="text-sm opacity-80 mb-4 line-clamp-2">{col.description}</p>
              <span className="text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Explore Collection →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
