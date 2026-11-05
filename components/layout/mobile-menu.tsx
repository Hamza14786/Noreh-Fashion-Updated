'use client';

import Link from 'next/link';
import { X, ChevronRight, Search, Heart, ShoppingBag, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { categories } from '@/lib/categories';
import { useStore } from '@/lib/store-context';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const mainLinks = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'New Arrivals', href: '/new-arrivals' },
  { label: 'Collections', href: '/collections' },
  { label: 'Sale', href: '/sale' },
];

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { openSearch } = useStore();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-background shadow-xl animate-slide-in-right flex flex-col">
        <div className="flex items-center justify-between px-5 h-16 border-b border-border">
          <span className="font-display text-lg font-bold tracking-[0.1em] uppercase">Menu</span>
          <button onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Search */}
          <button
            onClick={() => {
              onClose();
              openSearch();
            }}
            className="flex items-center gap-3 w-full px-5 py-4 border-b border-border text-sm text-muted-foreground"
          >
            <Search className="h-4 w-4" />
            Search products...
          </button>

          {/* Main links */}
          <div className="py-2">
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="flex items-center justify-between px-5 py-3 text-sm font-medium hover:bg-secondary transition-colors"
              >
                {link.label}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>

          {/* Shop categories */}
          <div className="border-t border-border pt-3 pb-3">
            <p className="px-5 text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">
              Shop by Category
            </p>
            <Link
              href="/shop"
              onClick={onClose}
              className="block px-5 py-2.5 text-sm font-medium text-foreground hover:text-accent-foreground transition-colors"
            >
              Shop All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                onClick={onClose}
                className="block px-5 py-2.5 text-sm text-foreground/80 hover:text-accent-foreground transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Account links */}
          <div className="border-t border-border pt-3 pb-3">
            <Link
              href="/account"
              onClick={onClose}
              className="flex items-center gap-3 px-5 py-2.5 text-sm hover:text-accent-foreground"
            >
              <User className="h-4 w-4" /> My Account
            </Link>
            <Link
              href="/wishlist"
              onClick={onClose}
              className="flex items-center gap-3 px-5 py-2.5 text-sm hover:text-accent-foreground"
            >
              <Heart className="h-4 w-4" /> Wishlist
            </Link>
            <Link
              href="/cart"
              onClick={onClose}
              className="flex items-center gap-3 px-5 py-2.5 text-sm hover:text-accent-foreground"
            >
              <ShoppingBag className="h-4 w-4" /> Shopping Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
