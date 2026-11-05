import Link from 'next/link';
import { Truck, Clock, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Shipping Policy - Noreh.pk',
  description: 'Learn about Noreh.pk nationwide delivery timelines, shipping charges, and Cash on Delivery.',
};

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground">Shipping Policy</span>
      </nav>

      {/* Header */}
      <div className="max-w-2xl mb-12">
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-2">Delivery & Fulfillment</p>
        <h1 className="font-display text-4xl md:text-5xl mb-4">Shipping Information</h1>
        <p className="text-muted-foreground leading-relaxed">
          We ensure seamless, fast, and secure delivery of your favorite Noreh.pk pieces across Pakistan and worldwide.
        </p>
      </div>

      {/* Quick Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="border border-border p-6 rounded-sm bg-card">
          <Truck className="h-8 w-8 text-foreground mb-3" />
          <h3 className="font-display text-lg mb-1">Free Delivery</h3>
          <p className="text-sm text-muted-foreground">
            Enjoy free shipping nationwide on all orders of PKR 5,000 or more.
          </p>
        </div>
        <div className="border border-border p-6 rounded-sm bg-card">
          <Clock className="h-8 w-8 text-foreground mb-3" />
          <h3 className="font-display text-lg mb-1">Fast Timelines</h3>
          <p className="text-sm text-muted-foreground">
            Orders are delivered in 2 to 4 business days in major cities, and 3 to 5 days nationwide.
          </p>
        </div>
        <div className="border border-border p-6 rounded-sm bg-card">
          <Truck className="h-8 w-8 text-foreground mb-3" />
          <h3 className="font-display text-lg mb-1">Cash on Delivery</h3>
          <p className="text-sm text-muted-foreground">
            Pay in cash when your package arrives at your doorstep.
          </p>
        </div>
      </div>

      {/* Detailed Shipping Info */}
      <div className="max-w-4xl space-y-10 text-sm leading-relaxed">
        <section className="space-y-4">
          <h2 className="font-display text-2xl text-foreground">1. Domestic Delivery Rates & Estimates</h2>
          <div className="overflow-x-auto border border-border rounded-sm">
            <table className="w-full text-left">
              <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Estimated Delivery</th>
                  <th className="py-3 px-4">Shipping Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-3.5 px-4 font-medium">Orders of PKR 5,000 or more (Nationwide)</td>
                  <td className="py-3.5 px-4 text-muted-foreground">2 – 4 Working Days</td>
                  <td className="py-3.5 px-4 font-medium text-success">FREE</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium">Orders under PKR 5,000 — Major Cities</td>
                  <td className="py-3.5 px-4 text-muted-foreground">2 – 3 Working Days</td>
                  <td className="py-3.5 px-4 text-muted-foreground">PKR 250 flat fee</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium">Orders under PKR 5,000 — Rest of Pakistan</td>
                  <td className="py-3.5 px-4 text-muted-foreground">3 – 5 Working Days</td>
                  <td className="py-3.5 px-4 text-muted-foreground">PKR 250 flat fee</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl text-foreground">2. Order Processing & Dispatch</h2>
          <p className="text-muted-foreground">
            All orders placed before 3:00 PM (PKT) Monday through Saturday are verified and processed on the same business day. Orders placed on Sundays or public holidays are processed on the subsequent working day.
          </p>
          <p className="text-muted-foreground">
            Order confirmation is shown at checkout, and an order confirmation email is sent when email delivery is configured. Courier tracking updates are not currently available through this website.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl text-foreground">3. Cash on Delivery (COD) Rules</h2>
          <p className="text-muted-foreground">
            For Cash on Delivery orders, our verification team may place a brief phone call or send an automated WhatsApp message to confirm delivery address details prior to dispatch. Please ensure you provide an active phone number.
          </p>
          <div className="bg-accent/20 p-4 border border-border rounded-sm flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-accent-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Please inspect the outer flyer for tampering before paying the rider. If the seal appears compromised, you may refuse delivery and inform our support team immediately.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl text-foreground">4. Delivery Questions</h2>
          <p className="text-muted-foreground">
            For a delivery update, contact our support team with your order number via WhatsApp at <strong className="text-foreground">+92 300 1234567</strong> or email at <strong className="text-foreground">support@noreh.pk</strong>. This website does not provide courier tracking numbers or live tracking.
          </p>
          <div className="pt-2">
            <Button asChild variant="outline">
              <Link href="/contact">Contact Support About Delivery</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

