'use client';

import Link from 'next/link';
import { categories } from '@/lib/categories';

export function MegaMenu() {
  const promoCategory = categories[0];

  return (
    <div className="absolute left-0 right-0 top-full bg-background border-t border-border shadow-lg animate-fade-in">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Menu columns */}
          <div className="col-span-12 lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="text-sm text-foreground/80 hover:text-accent-foreground transition-colors py-1.5 block"
                >
                  {category.name}
                </Link>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border">
              <Link
                href="/shop"
                className="text-sm font-medium text-foreground hover:text-accent-foreground transition-colors"
              >
                Shop all &rarr;
              </Link>
            </div>
          </div>

          {/* Promo image */}
          <div className="col-span-12 lg:col-span-4">
            <Link href={`/category/${promoCategory.slug}`} className="group block relative overflow-hidden rounded-sm">
              <div className="aspect-[4/5] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={promoCategory.image}
                  alt={promoCategory.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 text-white">
                <p className="text-xs tracking-[0.2em] uppercase opacity-80">Shop by category</p>
                <p className="font-display text-lg mt-1">{promoCategory.name}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
