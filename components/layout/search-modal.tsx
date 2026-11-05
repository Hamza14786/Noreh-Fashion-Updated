'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, X, TrendingUp, Clock } from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { searchProducts, popularSearches, products } from '@/lib/products';
import { categories } from '@/lib/categories';

export function SearchModal() {
  const { isSearchOpen, closeSearch } = useStore();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('me-recent-searches');
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!isSearchOpen) {
      setQuery('');
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch();
    };
    if (isSearchOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isSearchOpen, closeSearch]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchProducts(query).slice(0, 6);
  }, [query]);

  const trendingProducts = useMemo(
    () => products.filter((p) => p.isBestSeller).slice(0, 4),
    []
  );

  const saveSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [
      term,
      ...recentSearches.filter((s) => s !== term),
    ].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('me-recent-searches', JSON.stringify(updated));
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={closeSearch}
      />
      <div className="absolute top-0 left-0 right-0 bg-background shadow-xl animate-slide-up max-h-[85vh] overflow-y-auto">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          {/* Search input */}
          <div className="flex items-center gap-4 border-b border-border pb-4">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveSearch(query);
                }
              }}
              placeholder="Search for products, categories, collections..."
              className="flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
            />
            <button onClick={closeSearch} aria-label="Close search">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Results */}
          {query.trim() && results.length > 0 && (
            <div className="py-6">
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
                Products
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={() => {
                      saveSearch(query);
                      closeSearch();
                    }}
                    className="group flex gap-3"
                  >
                    <div className="w-16 h-20 shrink-0 overflow-hidden rounded-sm bg-secondary">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-sm font-medium group-hover:text-accent-foreground transition-colors">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {product.category.replace('-', ' ')}
                      </p>
                      <p className="text-sm mt-1">
                        {product.salePrice ? (
                          <>
                            <span className="text-destructive">${product.salePrice}</span>{' '}
                            <span className="text-xs text-muted-foreground line-through">
                              ${product.price}
                            </span>
                          </>
                        ) : (
                          <span>${product.price}</span>
                        )}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {query.trim() && results.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-lg font-display mb-2">No results found</p>
              <p className="text-sm text-muted-foreground">
                We couldn&apos;t find any products matching &quot;{query}&quot;.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Try a different search term or browse our categories.
              </p>
            </div>
          )}

          {/* Default content */}
          {!query.trim() && (
            <div className="py-6 space-y-8">
              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div>
                  <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3 flex items-center gap-2">
                    <Clock className="h-3 w-3" /> Recent Searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-3 py-1.5 text-sm bg-secondary rounded-full hover:bg-accent transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular searches */}
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                  Popular Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3 py-1.5 text-sm border border-border rounded-full hover:border-foreground transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trending products */}
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" /> Trending Now
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {trendingProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={closeSearch}
                      className="group"
                    >
                      <div className="aspect-[3/4] overflow-hidden rounded-sm bg-secondary mb-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <p className="text-xs font-medium group-hover:text-accent-foreground transition-colors truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${product.salePrice ?? product.price}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                  Browse Categories
                </p>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 6).map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/category/${cat.slug}`}
                      onClick={closeSearch}
                      className="px-3 py-1.5 text-sm border border-border rounded-full hover:border-foreground transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
