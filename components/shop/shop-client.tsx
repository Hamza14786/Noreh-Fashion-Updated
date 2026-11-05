'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { products as allProducts } from '@/lib/products';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatPrice } from '@/lib/utils';
import { APPAREL_SIZES, SHOE_SIZES } from '@/lib/product-sizes';

type SortOption = 'featured' | 'newest' | 'price-low' | 'price-high' | 'rating' | 'best-selling';

interface ShopClientProps {
  title: string;
  breadcrumb: { label: string; href: string }[];
  description?: string;
  products: Product[];
  initialCategory?: string;
}

const allColors = Array.from(
  new Map(
    allProducts.flatMap((product) => product.colors).map((color) => [color.name, color])
  ).values()
);
const allSizes = Array.from(new Set([...APPAREL_SIZES, ...SHOE_SIZES, ...allProducts.flatMap((product) => product.sizes)]));
const maxProductPrice = Math.ceil(
  allProducts.reduce((max, product) => Math.max(max, product.price), 0) / 1000
) * 1000;

export function ShopClient({
  title,
  breadcrumb,
  description,
  products: initialProducts,
  initialCategory,
}: ShopClientProps) {
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxProductPrice]);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showInStock, setShowInStock] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [storeProducts, setStoreProducts] = useState<Product[]>(initialProducts);
  useEffect(() => { fetch('/api/products').then(r => r.ok ? r.json() : null).then((items: Product[] | null) => { if (items) setStoreProducts(items); }).catch(() => {}); }, []);

  const filtered = useMemo(() => {
    let result = [...storeProducts];

    if (initialCategory) {
      result = result.filter((p) => p.category === initialCategory);
    }
    if (selectedColors.length > 0) {
      result = result.filter((p) =>
        p.colors.some((c) => selectedColors.includes(c.name))
      );
    }
    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.sizes.some((s) => selectedSizes.includes(s))
      );
    }
    result = result.filter((p) => {
      const price = p.salePrice ?? p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }
    if (showInStock) {
      result = result.filter((p) => p.stock > 0);
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
        break;
      case 'price-low':
        result.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
        break;
      case 'price-high':
        result.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'best-selling':
        result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        break;
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [storeProducts, initialCategory, selectedColors, selectedSizes, priceRange, minRating, showInStock, sortBy]);

  const visible = filtered.slice(0, visibleCount);

  const toggleArray = (arr: string[], value: string): string[] =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  const clearFilters = () => {
    setSelectedColors([]);
    setSelectedSizes([]);
    setPriceRange([0, maxProductPrice]);
    setMinRating(0);
    setShowInStock(false);
  };

  const activeFilterCount =
    selectedColors.length +
    selectedSizes.length +
    (minRating > 0 ? 1 : 0) +
    (showInStock ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < maxProductPrice ? 1 : 0);

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        {breadcrumb.map((item, i) => (
          <span key={i} className="flex items-center gap-2">
            <span>/</span>
            <Link href={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          </span>
        ))}
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl md:text-5xl mb-3">{title}</h1>
        {description && <p className="text-muted-foreground max-w-2xl">{description}</p>}
        <p className="text-sm text-muted-foreground mt-2">{filtered.length} products</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <FilterContent
            selectedColors={selectedColors}
            toggleColor={(c) => setSelectedColors((prev) => toggleArray(prev, c))}
            selectedSizes={selectedSizes}
            toggleSize={(s) => setSelectedSizes((prev) => toggleArray(prev, s))}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            minRating={minRating}
            setMinRating={setMinRating}
            showInStock={showInStock}
            setShowInStock={setShowInStock}
            clearFilters={clearFilters}
            activeFilterCount={activeFilterCount}
          />
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden flex items-center gap-2 text-sm font-medium"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
            <p className="hidden lg:block text-sm text-muted-foreground">
              Showing {visible.length} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">Sort:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-transparent border border-border rounded-sm pl-3 pr-8 py-2 text-sm cursor-pointer focus:outline-none focus:border-foreground"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Best Rated</option>
                  <option value="best-selling">Best Selling</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {visible.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-display text-2xl mb-2">No products found</p>
              <p className="text-sm text-muted-foreground mb-6">
                Try adjusting your filters to see more results.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {visible.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {visibleCount < filtered.length && (
                <div className="text-center mt-12">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setVisibleCount((c) => c + 12)}
                  >
                    Load More ({filtered.length - visibleCount} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setShowFilters(false)} />
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-background shadow-xl overflow-y-auto animate-slide-in-right">
            <div className="flex items-center justify-between px-5 h-16 border-b border-border sticky top-0 bg-background z-10">
              <h2 className="font-display text-lg font-semibold">Filters</h2>
              <button onClick={() => setShowFilters(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <FilterContent
                selectedColors={selectedColors}
                toggleColor={(c) => setSelectedColors((prev) => toggleArray(prev, c))}
                selectedSizes={selectedSizes}
                toggleSize={(s) => setSelectedSizes((prev) => toggleArray(prev, s))}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                minRating={minRating}
                setMinRating={setMinRating}
                showInStock={showInStock}
                setShowInStock={setShowInStock}
                clearFilters={clearFilters}
                activeFilterCount={activeFilterCount}
              />
              <Button className="w-full mt-6" onClick={() => setShowFilters(false)}>
                Show {filtered.length} Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface FilterContentProps {
  selectedColors: string[];
  toggleColor: (c: string) => void;
  selectedSizes: string[];
  toggleSize: (s: string) => void;
  priceRange: [number, number];
  setPriceRange: (v: [number, number]) => void;
  minRating: number;
  setMinRating: (v: number) => void;
  showInStock: boolean;
  setShowInStock: (v: boolean) => void;
  clearFilters: () => void;
  activeFilterCount: number;
}

function FilterContent(props: FilterContentProps) {
  return (
    <div className="space-y-8">
      {props.activeFilterCount > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {props.activeFilterCount} active {props.activeFilterCount === 1 ? 'filter' : 'filters'}
          </span>
          <button
            onClick={props.clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Price */}
      <div>
        <h3 className="text-xs tracking-[0.2em] uppercase font-medium mb-3">Price Range</h3>
        <div className="px-2">
          <Slider
            value={props.priceRange}
            onValueChange={(v) => props.setPriceRange([v[0], v[1]] as [number, number])}
            min={0}
            max={maxProductPrice}
            step={500}
            className="my-4"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatPrice(props.priceRange[0])}</span>
            <span>{formatPrice(props.priceRange[1])}</span>
          </div>
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 className="text-xs tracking-[0.2em] uppercase font-medium mb-3">Color</h3>
        <div className="flex flex-wrap gap-2">
          {allColors.map((color) => (
            <button
              key={color.name}
              onClick={() => props.toggleColor(color.name)}
              className={cn(
                'w-8 h-8 rounded-full border-2 transition-all',
                props.selectedColors.includes(color.name)
                  ? 'border-foreground ring-1 ring-foreground ring-offset-1'
                  : 'border-border'
              )}
              style={{ backgroundColor: color.hex }}
              title={color.name}
              aria-label={color.name}
            />
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="text-xs tracking-[0.2em] uppercase font-medium mb-3">Size</h3>
        <div className="flex flex-wrap gap-2">
          {allSizes.map((size) => (
            <button
              key={size}
              onClick={() => props.toggleSize(size)}
              className={cn(
                'min-w-[2.5rem] px-2.5 h-9 text-xs border transition-all',
                props.selectedSizes.includes(size)
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border hover:border-foreground'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-xs tracking-[0.2em] uppercase font-medium mb-3">Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 0].map((r) => (
            <label key={r} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="rating"
                checked={props.minRating === r}
                onChange={() => props.setMinRating(r)}
                className="border-border"
              />
              <span>
                {r === 0 ? 'All ratings' : `${r}★ & up`}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="text-xs tracking-[0.2em] uppercase font-medium mb-3">Availability</h3>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={props.showInStock}
            onChange={(e) => props.setShowInStock(e.target.checked)}
            className="rounded border-border"
          />
          <span className="text-foreground/80">In stock only</span>
        </label>
      </div>
    </div>
  );
}
