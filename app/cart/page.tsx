'use client';

import Link from 'next/link';
import { Trash2, ShoppingBag, ArrowRight, Heart } from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { productMap } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { QuantitySelector } from '@/components/product/quantity-selector';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { cart, removeFromCart, updateCartQuantity, cartSubtotal, addToWishlist, clearCart } = useStore();

  const shipping = cartSubtotal >= 5000 ? 0 : 250;
  const total = cartSubtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-20 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
        <h1 className="font-display text-3xl md:text-4xl mb-3">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Looks like you haven't added anything yet. Explore our collections and find your next favourite piece.
        </p>
        <Button asChild size="lg">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span>Cart</span>
      </nav>

      <h1 className="font-display text-3xl md:text-4xl mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Items */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => {
            const key = `${item.productId}-${item.size}-${item.color}`;
            const price = item.salePrice ?? item.price;
            return (
              <div key={key} className="flex gap-4 pb-6 border-b border-border last:border-0">
                <Link
                  href={`/products/${item.slug}`}
                  className="w-24 h-32 md:w-28 md:h-36 shrink-0 overflow-hidden bg-secondary"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link href={`/products/${item.slug}`} className="font-medium hover:text-accent-foreground transition-colors">
                        {item.name}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.color && <span>Color: {item.color}</span>}
                        {item.color && item.size !== 'M' && <span> · </span>}
                        {item.size !== 'M' && <span>Size: {item.size}</span>}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId, item.size, item.color)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-end justify-between mt-auto pt-3">
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(q) => updateCartQuantity(item.productId, item.size, item.color, q)}
                      max={item.stock}
                    />
                    <span className="font-medium">{formatPrice(price * item.quantity)}</span>
                  </div>
                  <button
                    onClick={() => {
                      const product = productMap[item.slug];
                      if (product) {
                        addToWishlist(product);
                        removeFromCart(item.productId, item.size, item.color);
                        toast.success(`${item.name} moved to wishlist`);
                      }
                    }}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent-foreground transition-colors mt-2"
                  >
                    <Heart className="h-3 w-3" /> Move to wishlist
                  </button>
                </div>
              </div>
            );
          })}
          <div className="flex justify-between">
            <Button asChild variant="outline">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
            <Button variant="ghost" onClick={() => { clearCart(); toast.success('Cart cleared'); }}>
              Clear Cart
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-secondary/50 rounded-sm p-6 sticky top-24">
            <h2 className="font-display text-xl mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium text-base">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            {cartSubtotal < 5000 && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Add {formatPrice(5000 - cartSubtotal)} more for free shipping
              </p>
            )}
            <Button asChild className="w-full mt-6" size="lg">
              <Link href="/checkout">
                Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
