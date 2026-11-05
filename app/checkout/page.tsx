'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Lock, Truck, Check, ArrowLeft } from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn, formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import type { Product } from '@/lib/types';

async function readJsonResponse(response: Response): Promise<unknown> {
  const body = await response.text();
  if (!body.trim()) return null;
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

export default function CheckoutPage() {
  const { cart, clearCart } = useStore();
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express'>('standard');
  const paymentMethod = 'cod' as const;
  const [placed, setPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const checkoutKey = useRef<{ fingerprint:string; key:string } | null>(null);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [catalogReady, setCatalogReady] = useState(false);

  useEffect(() => {
    fetch('/api/products').then(async response => {
      if (!response.ok) throw new Error('Catalog unavailable');
      const result = await readJsonResponse(response);
      if (!Array.isArray(result)) throw new Error('Catalog response was invalid');
      setCatalog(result as Product[]);
      setCatalogReady(true);
    }).catch(() => setCatalogReady(false));
  }, []);

  const priceFor = (productId:string, fallback:number, salePrice?:number) => {
    const product = catalog.find(item => item.id === productId);
    return product ? (product.salePrice ?? product.price) : (salePrice ?? fallback);
  };
  const displayedSubtotal = cart.reduce((sum,item)=>sum+priceFor(item.productId,item.price,item.salePrice)*item.quantity,0);

  const shipping = displayedSubtotal >= 5000 ? 0 : 250;
  const total = displayedSubtotal + shipping;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (submitting || !catalogReady) return;
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      const payload = {
        customer: { name: form.get('name'), email: form.get('email'), phone: form.get('phone') },
        shipping: { address: form.get('address'), city: form.get('city'), postal: form.get('postal'), country: form.get('country') },
        deliveryMethod, paymentMethod,
        items: cart.map(item => ({ productId: item.productId, quantity: item.quantity, expectedUnitPrice:priceFor(item.productId,item.price,item.salePrice), size: item.size, color: item.color })),
      };
      // Keep the retry key stable if a customer edits address/payment after a response timeout.
      const fingerprint = JSON.stringify(payload.items.map(item=>[item.productId,item.quantity,item.size,item.color]));
      let retry = checkoutKey.current;
      try { retry = JSON.parse(sessionStorage.getItem('noreh-checkout-retry') || 'null') || retry; } catch {}
      if (retry?.fingerprint !== fingerprint) retry = { fingerprint, key: crypto.randomUUID() };
      checkoutKey.current = retry;
      try { sessionStorage.setItem('noreh-checkout-retry', JSON.stringify(retry)); } catch {}
      const response = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, idempotencyKey: retry.key }) });
      const parsed = await readJsonResponse(response);
      const result = parsed && typeof parsed === 'object' ? parsed as { error?: string; orderNumber?: string } : {};
      if (!response.ok) {
        if(response.status===409&&String(result.error||'').includes('price changed')) fetch('/api/products').then(r=>r.ok?r.json():null).then(items=>{if(items)setCatalog(items)}).catch(()=>{});
        toast.error(result.error || 'Could not place order'); return;
      }
      try { sessionStorage.removeItem('noreh-checkout-retry'); } catch {}
      checkoutKey.current = null;
      setOrderNumber(result.orderNumber); setPlaced(true); clearCart(); toast.success('Order placed successfully!');
    } catch { toast.error('Could not reach the store. Please try again.'); }
    finally { setSubmitting(false); }
  };

  if (placed) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-success text-success-foreground flex items-center justify-center mx-auto mb-6">
          <Check className="h-8 w-8" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl mb-3">Order Confirmed</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Thank you for your purchase. Your order number is <strong>{orderNumber}</strong>. For delivery questions, contact support and include your order number.
        </p>
        <Button asChild size="lg">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-20 text-center">
        <h1 className="font-display text-3xl mb-3">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">Add items to your cart before checking out.</p>
        <Button asChild size="lg">
          <Link href="/shop">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link href="/cart" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Back to Cart
        </Link>
      </nav>

      <h1 className="font-display text-3xl md:text-4xl mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Form fields */}
        <div className="lg:col-span-2 space-y-8">
          {/* Customer info */}
          <section>
            <h2 className="font-display text-xl mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" required placeholder="Ayesha Khan" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="ayesha@example.com" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" required placeholder="+92 300 1234567" className="mt-1" />
              </div>
            </div>
          </section>

          <Separator />

          {/* Shipping address */}
          <section>
            <h2 className="font-display text-xl mb-4">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="address">Street Address</Label>
                <Input id="address" name="address" required placeholder="House 123, Gulberg III" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" required placeholder="Lahore" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="postal">Postal Code</Label>
                <Input id="postal" name="postal" required placeholder="54000" className="mt-1" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="country">Country</Label>
                <select
                  id="country"
                  name="country"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option>Pakistan</option>
                  <option>United Arab Emirates</option>
                  <option>United Kingdom</option>
                  <option>United States</option>
                  <option>Saudi Arabia</option>
                  <option>Canada</option>
                  <option>Australia</option>
                </select>
              </div>
            </div>
          </section>

          <Separator />

          {/* Delivery */}
          <section>
            <h2 className="font-display text-xl mb-4">Delivery Method</h2>
            <div className="space-y-3">
              {([
                { id: 'standard', label: 'Standard Delivery', desc: '3-5 business days', price: shipping === 0 ? 'Free' : 'Rs. 250' },
                { id: 'express', label: 'Express Delivery', desc: '1-2 business days', price: shipping === 0 ? 'Free' : 'Rs. 250' },
              ] as const).map((opt) => (
                <label
                  key={opt.id}
                  className={cn(
                    'flex items-center gap-3 p-4 border rounded-sm cursor-pointer transition-all',
                    deliveryMethod === opt.id ? 'border-foreground bg-secondary/50' : 'border-border hover:border-foreground/50'
                  )}
                >
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === opt.id}
                    onChange={() => setDeliveryMethod(opt.id)}
                    className="accent-foreground"
                  />
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                  <span className="text-sm font-medium">{opt.price}</span>
                </label>
              ))}
            </div>
          </section>

          <Separator />

          {/* Payment */}
          <section>
            <h2 className="font-display text-xl mb-4">Payment Method</h2>
            <div className="flex items-center gap-3 p-4 border border-foreground bg-secondary/50 rounded-sm">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Cash on Delivery</p>
                <p className="text-xs text-muted-foreground">Pay in cash when your order arrives.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-secondary/50 rounded-sm p-6 sticky top-24">
            <h2 className="font-display text-xl mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {cart.map((item) => {
                const key = `${item.productId}-${item.size}-${item.color}`;
                return (
                  <div key={key} className="flex gap-3">
                    <div className="w-14 h-18 shrink-0 overflow-hidden bg-secondary rounded-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-xs font-medium">{formatPrice(priceFor(item.productId,item.price,item.salePrice) * item.quantity)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(displayedSubtotal)}</span>
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

            <Button type="submit" disabled={submitting || !catalogReady} className="w-full mt-6" size="lg">
              <Lock className="h-4 w-4 mr-2" /> {submitting ? 'Placing order…' : 'Place Order'}
            </Button>

            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              Secure 256-bit SSL encrypted checkout
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
