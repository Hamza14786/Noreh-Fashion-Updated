'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useStore } from '@/lib/store-context';
import type { Product } from '@/lib/types';
import { Rating } from './rating';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SizeSelector } from './size-selector';
import { QuantitySelector } from './quantity-selector';
import { availableProductSizes } from '@/lib/product-sizes';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, openCart } = useStore();
  const availableSizes = availableProductSizes(product);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || '');
  const [quantity, setQuantity] = useState(1);

  const inWishlist = isInWishlist(product.id);
  const hasSale = product.salePrice !== undefined;
  const discount = hasSale
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  const badge = product.isBestSeller
    ? { text: 'Best Seller', variant: 'default' as const }
    : product.isNewArrival
    ? { text: 'New', variant: 'secondary' as const }
    : null;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.success(`${product.name} removed from wishlist`);
    } else {
      addToWishlist(product);
      toast.success(`${product.name} added to wishlist`);
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const handleAddToCart = () => {
    if (!selectedSize && availableSizes.length > 0) {
      toast.error('Please select a size');
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
    toast.success(`${product.name} added to cart`);
    setQuickViewOpen(false);
    setQuantity(1);
    openCart();
  };

  return (
    <>
      <Link href={`/products/${product.slug}`} className="group block">
        <div className="relative overflow-hidden bg-secondary aspect-[3/4]">
          {/* Primary image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          {/* Secondary image on hover */}
          {product.images[1] && (
            <img
              src={product.images[1]}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              loading="lazy"
              decoding="async"
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {badge && (
              <Badge
                variant={badge.variant}
                className={cn(
                  'text-[10px] tracking-wide',
                  badge.variant === 'default' && 'bg-primary text-primary-foreground',
                  badge.variant === 'secondary' && 'bg-background text-foreground border border-border'
                )}
              >
                {badge.text}
              </Badge>
            )}
            {hasSale && (
              <Badge className="bg-destructive text-destructive-foreground text-[10px]">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-all shadow-sm"
            aria-label="Add to wishlist"
          >
            <Heart
              className={cn(
                'h-4 w-4',
                inWishlist ? 'fill-destructive text-destructive' : 'text-foreground'
              )}
            />
          </button>

          {/* Quick actions on hover */}
          <div className="absolute bottom-0 left-0 right-0 flex gap-2 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleQuickAdd}
              className="flex-1 bg-background/95 backdrop-blur-sm text-foreground text-xs font-medium py-2.5 hover:bg-background transition-colors flex items-center justify-center gap-1.5"
            >
              <Eye className="h-3.5 w-3.5" /> Quick View
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickViewOpen(true);
              }}
              className="bg-primary text-primary-foreground text-xs font-medium p-2.5 hover:bg-primary/90 transition-colors"
              aria-label="Add to cart"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="pt-3 pb-1">
          <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">
            {product.brand}
          </p>
          <h3 className="text-sm font-medium leading-snug line-clamp-1 group-hover:text-accent-foreground transition-colors">
            {product.name}
          </h3>
          <div className="mt-1.5">
            <Rating rating={product.rating} count={product.reviewCount} />
          </div>
          <div className="flex items-center gap-2 mt-2">
            {hasSale ? (
              <>
                <span className="text-sm font-medium text-destructive">
                  {formatPrice(product.salePrice!)}
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-sm font-medium">{formatPrice(product.price)}</span>
            )}
          </div>
          {/* Color options */}
          {product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              {product.colors.map((color) => (
                <div
                  key={color.name}
                  className="w-3 h-3 rounded-full border border-border"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Quick View Dialog */}
      <Dialog open={quickViewOpen} onOpenChange={setQuickViewOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="aspect-square md:aspect-auto bg-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="p-6 flex flex-col">
              <DialogHeader className="text-left">
                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                  {product.brand}
                </p>
                <DialogTitle className="font-display text-2xl">{product.name}</DialogTitle>
              </DialogHeader>
              <div className="mt-2">
                <Rating rating={product.rating} count={product.reviewCount} />
              </div>
              <p className="text-sm text-muted-foreground mt-3 whitespace-pre-line leading-relaxed">
                {product.description}
              </p>
              <div className="flex items-center gap-3 mt-4">
                {hasSale ? (
                  <>
                    <span className="text-2xl font-medium text-destructive">
                      {formatPrice(product.salePrice!)}
                    </span>
                    <span className="text-base text-muted-foreground line-through">
                      {formatPrice(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-medium">{formatPrice(product.price)}</span>
                )}
              </div>

              {/* Color selection */}
              {product.colors.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs tracking-wide uppercase text-muted-foreground mb-2">
                    Color: <span className="text-foreground">{selectedColor}</span>
                  </p>
                  <div className="flex gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={cn(
                          'w-8 h-8 rounded-full border-2 transition-all',
                          selectedColor === color.name
                            ? 'border-foreground ring-1 ring-foreground ring-offset-1'
                            : 'border-border'
                        )}
                        style={{ backgroundColor: color.hex }}
                        aria-label={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size selection */}
              <div className="mt-4">
                <p className="text-xs tracking-wide uppercase text-muted-foreground mb-2">Size</p>
                <SizeSelector
                  sizes={availableSizes}
                  selected={selectedSize}
                  onSelect={setSelectedSize}
                />
              </div>

              {/* Quantity */}
              <div className="mt-4">
                <p className="text-xs tracking-wide uppercase text-muted-foreground mb-2">Quantity</p>
                <QuantitySelector value={quantity} onChange={setQuantity} max={product.stock} />
              </div>

              <Button className="mt-6 w-full" size="lg" onClick={handleAddToCart}>
                Add to Cart — {formatPrice((product.salePrice ?? product.price) * quantity)}
              </Button>
              <Button asChild variant="outline" className="mt-2 w-full">
                <Link href={`/products/${product.slug}`} onClick={() => setQuickViewOpen(false)}>
                  View Full Details
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
