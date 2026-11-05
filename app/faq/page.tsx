import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { HelpCircle, Mail, Phone } from 'lucide-react';

export const metadata = {
  title: 'Frequently Asked Questions (FAQs) - Noreh.pk',
  description: 'Find answers to common questions about Noreh.pk orders, shipping, cash on delivery, fabrics, and returns.',
};

export default function FAQPage() {
  const categories = [
    {
      name: 'Orders & Payments',
      faqs: [
        {
          q: 'What payment methods do you accept?',
          a: 'Cash on Delivery (COD) is currently the only payment method available at checkout across Pakistan.',
        },
        {
          q: 'How do I place an order online?',
          a: 'Browse our collection, select your desired article and size, click "Add to Cart", then proceed to checkout. Enter your delivery address, choose Cash on Delivery, and click "Place Order". Your Order ID appears after checkout. An order confirmation email is sent when email delivery is configured.',
        },
        {
          q: 'Can I cancel or modify my order after placing it?',
          a: 'Yes, you can modify or cancel your order within 6 hours of placement by calling or sending a WhatsApp message to our customer care team at +92 300 1234567 before your parcel is handed over to the courier.',
        },
        {
          q: 'Do you take custom stitching orders?',
          a: 'Currently our suits are offered as premium unstitched 3-piece sets and ready-to-wear pret collections. Selected custom stitching services may be available during pre-booking campaigns.',
        },
      ],
    },
    {
      name: 'Shipping & Delivery',
      faqs: [
        {
          q: 'How long does delivery take?',
          a: 'For major cities (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad), delivery takes 2 to 4 business days. For other nationwide cities and remote areas, delivery takes 3 to 5 business days.',
        },
        {
          q: 'What are the delivery charges?',
          a: 'Delivery is 100% FREE nationwide on all orders of PKR 5,000 or more. For orders under PKR 5,000, a standard flat shipping fee of PKR 250 applies across Pakistan.',
        },
        {
          q: 'How can I track my parcel?',
          a: 'Automated courier tracking is not currently available. For a delivery update, contact support with your order number.',
        },
      ],
    },
    {
      name: 'Returns & Exchanges',
      faqs: [
        {
          q: 'What is your return and exchange policy?',
          a: 'We provide a hassle-free 7-day return and exchange policy from the date of delivery. Items must be unworn, unwashed, unaltered, and with original brand tags attached.',
        },
        {
          q: 'How long does a refund take?',
          a: 'Once we receive and verify the returned item, our support team will contact you to arrange the refund within 3 to 5 working days.',
        },
        {
          q: 'What should I do if I receive a defective or wrong item?',
          a: 'Please notify us within 48 hours of delivery with photos of the defect via WhatsApp (+92 300 1234567). We will arrange an immediate replacement or full refund with 100% free return shipping.',
        },
      ],
    },
    {
      name: 'Fabrics & Quality Care',
      faqs: [
        {
          q: 'What fabrics do you specialize in?',
          a: 'Noreh.pk specializes in premium breathable Dhanak, luxury Lawn, Khaddar, Silk, Chiffon, Organza, and Velvet, embellished with intricate thread embroidery and artisanal handwork.',
        },
        {
          q: 'What are the washing and care instructions?',
          a: 'Dry cleaning is recommended for all heavily embroidered and formal suits. For everyday wear, gentle hand wash in cold water without bleach and hang drying in the shade is recommended to preserve embroidery luster and fabric life.',
        },
        {
          q: 'Are the colors exactly as shown in photographs?',
          a: 'All our product shoots are conducted under studio lighting. While we strive to show colors with high precision, minor variations may occur depending on your mobile or monitor display settings.',
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground">Frequently Asked Questions</span>
      </nav>

      {/* Header */}
      <div className="max-w-2xl mb-12">
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-2">Help Center</p>
        <h1 className="font-display text-4xl md:text-5xl mb-4">Frequently Asked Questions</h1>
        <p className="text-muted-foreground leading-relaxed">
          Need quick answers? Here are the most common questions our customers ask about ordering, shipping, fabrics, and returns.
        </p>
      </div>

      {/* FAQs categorized */}
      <div className="max-w-3xl space-y-12 mb-16">
        {categories.map((cat, idx) => (
          <div key={idx} className="space-y-4">
            <h2 className="font-display text-2xl border-b border-border pb-2 text-foreground">
              {cat.name}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {cat.faqs.map((faq, fIdx) => (
                <AccordionItem key={fIdx} value={`item-${idx}-${fIdx}`}>
                  <AccordionTrigger className="text-left font-medium text-base hover:text-accent-foreground py-4">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-sm pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>

      {/* Bottom assistance box */}
      <div className="max-w-3xl border border-border p-8 rounded-sm bg-secondary/30 text-center">
        <HelpCircle className="h-10 w-10 text-foreground mx-auto mb-3" />
        <h3 className="font-display text-2xl mb-2">Didn&#39;t find what you&#39;re looking for?</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
          Our friendly customer support representatives are available Monday to Saturday to answer all your queries.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/contact">Contact Support</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer">
              WhatsApp Us
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

