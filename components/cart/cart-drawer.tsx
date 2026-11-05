'use client';

import Link from 'next/link';
import { X, ShoppingBag, Plus, Minus, Trash2, Heart } from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { productMap } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    addToWishlist,
  } = useStore();

  if (!isCartOpen) return null;

  const shipping = cartSubtotal >= 5000 ? 0 : 250;
  const total = cartSubtotal + shipping;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={closeCart}
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-xl animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-border shrink-0">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({cart.length})
          </h2>
          <button onClick={closeCart} aria-label="Close cart">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="font-display text-xl mb-2">Your cart is empty</p>
            <p className="text-sm text-muted-foreground mb-6">
              Discover our latest collections and add your favourite pieces.
            </p>
            <Button asChild onClick={closeCart}>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {cart.map((item) => {
                const key = `${item.productId}-${item.size}-${item.color}`;
                const price = item.salePrice ?? item.price;
                return (
                  <div key={key} className="flex gap-4">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeCart}
                      className="w-20 h-28 shrink-0 overflow-hidden rounded-sm bg-secondary"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between gap-2">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="text-sm font-medium hover:text-accent-foreground transition-colors"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.productId, item.size, item.color)}
                          className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.color && <span>{item.color}</span>}
                        {item.color && item.size !== 'M' && <span> · </span>}
                        {item.size !== 'M' && <span>Size {item.size}</span>}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-2">
                        <div className="flex items-center border border-border rounded-sm">
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.productId,
                                item.size,
                                item.color,
                                item.quantity - 1
                              )
                            }
                            className="p-1.5 hover:bg-secondary transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-3 text-sm">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.productId,
                                item.size,
                                item.color,
                                item.quantity + 1
                              )
                            }
                            className="p-1.5 hover:bg-secondary transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm font-medium">
                          {formatPrice(price * item.quantity)}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const product = productMap[item.slug];
                          if (product) {
                            addToWishlist(product);
                          }
                          removeFromCart(item.productId, item.size, item.color);
                          toast.success(`${item.name} moved to wishlist`);
                        }}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent-foreground transition-colors mt-2"
                      >
                        <Heart className="h-3 w-3" /> Move to wishlist
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="border-t border-border px-5 py-4 space-y-3 shrink-0">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              {cartSubtotal < 5000 && (
                <p className="text-xs text-muted-foreground text-center">
                  Add {formatPrice(5000 - cartSubtotal)} more for free shipping
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <Button asChild variant="outline" className="flex-1" onClick={closeCart}>
                  <Link href="/cart">View Cart</Link>
                </Button>
                <Button asChild className="flex-1" onClick={closeCart}>
                  <Link href="/checkout">Checkout</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
