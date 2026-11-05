import Link from 'next/link';
import { RefreshCw, CheckCircle, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Returns & Exchanges Policy - Noreh.pk',
  description: 'Understand Noreh.pk 7-day hassle-free return and exchange policy, requirements, and process.',
};

export default function ReturnsPage() {
  const steps = [
    {
      step: '01',
      title: 'Initiate Request',
      description: 'Contact us within 7 days of receiving your parcel via WhatsApp (+92 300 1234567) or email (support@noreh.pk) with your Order ID and photo/video evidence if defective.',
    },
    {
      step: '02',
      title: 'Pack the Item',
      description: 'Ensure the item is in original condition, unworn, unwashed, unaltered, and with all Noreh.pk brand tags and packaging intact.',
    },
    {
      step: '03',
      title: 'Courier Dispatch',
      description: 'Send the package back through any traceable courier service to our return center address provided by our support team.',
    },
    {
      step: '04',
      title: 'Inspection & Refund / Exchange',
      description: 'Once received and inspected (within 48 hours), our support team will contact you to arrange a replacement or refund.',
    },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground">Returns & Exchanges</span>
      </nav>

      {/* Header */}
      <div className="max-w-2xl mb-12">
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-2">Customer Satisfaction</p>
        <h1 className="font-display text-4xl md:text-5xl mb-4">7-Day Hassle-Free Returns</h1>
        <p className="text-muted-foreground leading-relaxed">
          At Noreh.pk, we take pride in the quality and craftsmanship of our collections. If you are not completely satisfied with your purchase, we offer a straightforward exchange and return policy.
        </p>
      </div>

      {/* Step by Step Process */}
      <div className="mb-16">
        <h2 className="font-display text-2xl mb-6">How Our Return Process Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item) => (
            <div key={item.step} className="border border-border p-6 rounded-sm bg-card relative">
              <span className="font-display text-3xl text-muted-foreground/30 font-bold block mb-3">
                {item.step}
              </span>
              <h3 className="font-display text-lg mb-2">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Guidelines & Terms */}
      <div className="max-w-4xl space-y-8 text-sm leading-relaxed border-t border-border pt-12">
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-foreground">Return & Exchange Eligibility</h2>
          <ul className="space-y-2 text-muted-foreground list-disc pl-5">
            <li>Requests must be filed within <strong>7 days</strong> of delivery date.</li>
            <li>Articles must be unworn, unwashed, without stains, perfume scent, or makeup marks.</li>
            <li>All original Noreh.pk price tags, barcodes, and protective polybags must be attached.</li>
            <li>Unstitched suits must remain intact without cuts, alterations, or missing pieces (e.g. embroidered front, sleeves, trouser, or shawl).</li>
            <li>Items purchased during Clearance / Final Flash Sales are eligible for size exchange only (subject to availability).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl text-foreground">Damaged or Defective Articles</h2>
          <p className="text-muted-foreground">
            In the rare event that an item arrives damaged, defective, or incorrect, Noreh.pk covers 100% of courier pickup/return charges. We will immediately replace the piece free of cost or issue a full refund upon verification.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl text-foreground">Refund Method & Timeline</h2>
          <p className="text-muted-foreground">
            Refunds for verified returns are arranged by our support team within <strong>3 to 5 business days</strong> after the returned parcel reaches our facility.
          </p>
        </section>

        {/* CTA */}
        <div className="border border-border p-6 rounded-sm bg-secondary/40 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
          <div>
            <h3 className="font-display text-lg mb-1">Have a return or exchange request?</h3>
            <p className="text-xs text-muted-foreground">Our support team is ready to guide you step-by-step.</p>
          </div>
          <Button asChild size="lg">
            <Link href="/contact">Start a Return</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

