import Link from 'next/link';

export const metadata = {
  title: 'Terms & Conditions - Noreh.pk',
  description: 'Read the terms and conditions governing the use of Noreh.pk e-commerce platform and purchases.',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground">Terms & Conditions</span>
      </nav>

      {/* Header */}
      <div className="max-w-3xl mb-12">
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-2">Legal Agreement</p>
        <h1 className="font-display text-4xl md:text-5xl mb-4">Terms & Conditions</h1>
        <p className="text-sm text-muted-foreground">
          Last Updated: October 2026 · Please read these terms carefully before making a purchase
        </p>
      </div>

      <div className="max-w-3xl space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-display text-xl text-foreground">1. Overview & Acceptance</h2>
          <p>
            By accessing or purchasing from <strong className="text-foreground">Noreh.pk</strong>, you agree to be bound by the terms, conditions, and notices stated herein. These terms apply to all users of the site, including browsers, customers, and merchants.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-foreground">2. Products, Pricing & Availability</h2>
          <p>
            All prices listed on Noreh.pk are quoted in <strong className="text-foreground">Pakistani Rupees (PKR)</strong> and are inclusive of applicable taxes unless specified otherwise. We reserve the right to modify prices or discontinue articles without prior notice.
          </p>
          <p>
            We strive to display the colors and details of our Dhanak, lawn, and embroidered suits as accurately as possible. However, actual fabric colors may vary slightly due to studio lighting and variations in digital screens.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-foreground">3. Orders & Verification</h2>
          <p>
            Placing an order constitutes an offer to purchase. Noreh.pk reserves the right to accept or decline any order for reasons including non-availability of stock, incomplete delivery address, or failure of telephone/WhatsApp order verification for Cash on Delivery orders.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-foreground">4. Shipping, Delivery & Returns</h2>
          <p>
            Delivery timelines and return policies are governed by our official <Link href="/shipping" className="text-foreground underline">Shipping Policy</Link> and <Link href="/returns" className="text-foreground underline">Return Policy</Link>. Customers are requested to review both policies before completing checkout.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-foreground">5. Intellectual Property</h2>
          <p>
            All content on this website—including images, embroidered design patterns, photographs, branding, logos, and written text—is the exclusive intellectual property of Noreh.pk. Reproduction, distribution, or duplication of any material without express written consent is strictly prohibited.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-foreground">6. Governing Law</h2>
          <p>
            These terms and any disputes arising out of the purchase of products shall be governed and interpreted in accordance with the laws of the Islamic Republic of Pakistan, subject to the jurisdiction of courts located in Lahore, Pakistan.
          </p>
        </section>
      </div>
    </div>
  );
}

