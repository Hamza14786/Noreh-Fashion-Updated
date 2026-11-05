'use client';

import Link from 'next/link';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { productMap } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart, openCart } = useStore();

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-20 text-center">
        <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
        <h1 className="font-display text-3xl md:text-4xl mb-3">Your Wishlist is Empty</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Save your favorite styles here and come back anytime. Tap the heart icon on any product to add it to your wishlist.
        </p>
        <Button asChild size="lg">
          <Link href="/shop">Explore Collection</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span>Wishlist</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl md:text-4xl">My Wishlist</h1>
        <span className="text-sm text-muted-foreground">{wishlist.length} items</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {wishlist.map((item) => {
          const product = productMap[item.slug];
          const price = item.salePrice ?? item.price;
          return (
            <div key={item.productId} className="group">
              <Link href={`/products/${item.slug}`} className="block relative overflow-hidden bg-secondary aspect-[3/4]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeFromWishlist(item.productId);
                    toast.success(`${item.name} removed from wishlist`);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-all"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Link>
              <div className="pt-3">
                <Link href={`/products/${item.slug}`} className="text-sm font-medium hover:text-accent-foreground transition-colors line-clamp-1">
                  {item.name}
                </Link>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-medium">
                    {item.salePrice ? (
                      <>
                        <span className="text-destructive">${item.salePrice}</span>{' '}
                        <span className="text-xs text-muted-foreground line-through">${item.price}</span>
                      </>
                    ) : (
                      <span>${item.price}</span>
                    )}
                  </span>
                  {product && (
                    <span className={`text-xs ${product.stock > 0 ? 'text-success' : 'text-destructive'}`}>
                      {product.stock > 0 ? 'In stock' : 'Out of stock'}
                    </span>
                  )}
                </div>
                <Button
                  className="w-full mt-3"
                  size="sm"
                  disabled={!product || product.stock === 0}
                  onClick={() => {
                    if (product) {
                      addToCart(product, product.sizes[0] || 'M', product.colors[0]?.name || '');
                      toast.success(`${item.name} added to cart`);
                      openCart();
                    }
                  }}
                >
                  <ShoppingBag className="h-3.5 w-3.5 mr-1" /> Add to Cart
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
