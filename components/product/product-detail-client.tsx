'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  ShoppingBag,
  Truck,
  RefreshCw,
  Shield,
  ChevronRight,
  Minus,
  Plus,
  Check,
} from 'lucide-react';
import { useStore } from '@/lib/store-context';
import type { Product } from '@/lib/types';
import { Rating } from '@/components/product/rating';
import { SizeSelector } from '@/components/product/size-selector';
import { QuantitySelector } from '@/components/product/quantity-selector';
import { SizeGuide } from '@/components/product/size-guide';
import { ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn, formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { availableProductSizes } from '@/lib/product-sizes';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const router = useRouter();
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, openCart } = useStore();
  const availableSizes = availableProductSizes(product);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || '');
  const [quantity, setQuantity] = useState(1);

  const inWishlist = isInWishlist(product.id);
  const hasSale = product.salePrice !== undefined;
  const discount = hasSale
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;
  const effectivePrice = product.salePrice ?? product.price;

  const handleAddToCart = () => {
    if (!selectedSize && availableSizes.length > 0) {
      toast.error('Please select a size');
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
    toast.success(`${product.name} added to cart`);
    openCart();
  };

  const handleBuyNow = () => {
    if (!selectedSize && availableSizes.length > 0) {
      toast.error('Please select a size');
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
    router.push('/checkout');
  };

  const handleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.success(`${product.name} removed from wishlist`);
    } else {
      addToWishlist(product);
      toast.success(`${product.name} added to wishlist`);
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 lg:px-8 pt-6">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/category/${product.category}`} className="hover:text-foreground transition-colors capitalize">
            {product.category.replace('-', ' ')}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-x-visible scrollbar-hide">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    'w-16 h-20 md:w-20 md:h-24 shrink-0 overflow-hidden border-2 transition-all',
                    selectedImage === i ? 'border-foreground' : 'border-border hover:border-foreground/50'
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
            {/* Main image */}
            <div className="flex-1 overflow-hidden bg-secondary aspect-[3/4]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                fetchPriority="high"
                decoding="async"
              />
            </div>
          </div>

          {/* Info */}
          <div className="lg:pl-4">
            <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">
              {product.brand}
            </p>
            <h1 className="font-display text-3xl md:text-4xl mb-3">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <Rating rating={product.rating} count={product.reviewCount} size="md" />
              <span className="text-sm text-muted-foreground">
                {product.stock > 0 ? (
                  <span className="text-success flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> In stock
                  </span>
                ) : (
                  <span className="text-destructive">Out of stock</span>
                )}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              {hasSale ? (
                <>
                  <span className="text-3xl font-medium text-destructive">
                    {formatPrice(product.salePrice!)}
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                  <Badge className="bg-destructive text-destructive-foreground">-{discount}%</Badge>
                </>
              ) : (
                <span className="text-3xl font-medium">{formatPrice(product.price)}</span>
              )}
            </div>

            <p className="text-muted-foreground mb-6 whitespace-pre-line leading-relaxed">{product.description}</p>

            <Separator className="mb-6" />

            {/* Color selection */}
            {product.colors.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-medium mb-2">
                  Color: <span className="text-muted-foreground">{selectedColor}</span>
                </p>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={cn(
                        'w-9 h-9 rounded-full border-2 transition-all',
                        selectedColor === color.name
                          ? 'border-foreground ring-1 ring-foreground ring-offset-1'
                          : 'border-border hover:border-foreground/50'
                      )}
                      style={{ backgroundColor: color.hex }}
                      aria-label={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            {availableSizes.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Size</p>
                  <SizeGuide
                    trigger={
                      <button className="text-xs text-muted-foreground hover:text-foreground underline">
                        Size Guide
                      </button>
                    }
                  />
                </div>
                <SizeSelector
                  sizes={availableSizes}
                  selected={selectedSize}
                  onSelect={setSelectedSize}
                />
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Quantity</p>
              <QuantitySelector value={quantity} onChange={setQuantity} max={product.stock} />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mb-4">
              <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={product.stock === 0}>
                <ShoppingBag className="h-4 w-4 mr-2" /> Add to Cart
              </Button>
              <Button size="lg" variant="outline" onClick={handleBuyNow} disabled={product.stock === 0}>
                Buy Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-3"
                onClick={handleWishlist}
                aria-label="Add to wishlist"
              >
                <Heart className={cn('h-5 w-5', inWishlist && 'fill-destructive text-destructive')} />
              </Button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-border">
              <div className="flex flex-col items-center text-center gap-1">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Free shipping on orders of Rs. 5,000 or more</p>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <RefreshCw className="h-5 w-5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">30-day free returns</p>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Secure checkout</p>
              </div>
            </div>

            {/* Product details accordion */}
            <Accordion type="single" collapsible className="mt-8">
              <AccordionItem value="details">
                <AccordionTrigger className="text-sm font-medium">Product Details</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  <ul className="space-y-1">
                    <li>SKU: {product.sku}</li>
                    <li>Category: <span className="capitalize">{product.category.replace('-', ' ')}</span></li>
                    <li>Collection: {product.collection.replace('-', ' ')}</li>
                    <li>Tags: {product.tags.join(', ')}</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="material">
                <AccordionTrigger className="text-sm font-medium">Material & Care</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  <p className="mb-2"><span className="font-medium text-foreground">Material:</span> {product.material}</p>
                  <p><span className="font-medium text-foreground">Care:</span> {product.careInstructions}</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger className="text-sm font-medium">Shipping & Returns</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  <p className="mb-2">{product.shippingInfo}</p>
                  <p>{product.returnPolicy}</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Reviews */}
        <section className="mt-16 lg:mt-24">
          <div className="border-t border-border pt-12">
            <h2 className="font-display text-2xl md:text-3xl mb-6">
              Customer Reviews ({product.reviewCount})
            </h2>
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="md:w-48 shrink-0 text-center md:text-left">
                <p className="font-display text-5xl mb-2">{product.rating}</p>
                <Rating rating={product.rating} showCount={false} size="md" />
                <p className="text-sm text-muted-foreground mt-2">{product.reviewCount} reviews</p>
              </div>
              <div className="flex-1 space-y-4">
                {product.reviews.map((review) => (
                  <div key={review.id} className="border border-border rounded-sm p-4 md:p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-medium text-sm">
                          {review.author.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{review.author}</p>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                      </div>
                      <Rating rating={review.rating} showCount={false} />
                    </div>
                    <p className="text-sm font-medium mb-1">{review.title}</p>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 lg:mt-24">
            <div className="flex items-end justify-between mb-8">
              <h2 className="font-display text-2xl md:text-3xl">You May Also Like</h2>
              <Link
                href="/shop"
                className="text-sm font-medium hover:text-accent-foreground transition-colors flex items-center gap-1"
              >
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
