import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - Noreh.pk',
  description: 'Read the privacy policy of Noreh.pk regarding personal data collection, usage, and protection.',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground">Privacy Policy</span>
      </nav>

      {/* Header */}
      <div className="max-w-3xl mb-12">
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-2">Legal & Trust</p>
        <h1 className="font-display text-4xl md:text-5xl mb-4">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">
          Last Updated: October 2026 · Effective across Noreh.pk digital platforms
        </p>
      </div>

      <div className="max-w-3xl space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-display text-xl text-foreground">1. Introduction</h2>
          <p>
            Welcome to <strong className="text-foreground">Noreh.pk</strong>. We value your privacy and are committed to safeguarding your personal information. This Privacy Policy details how we collect, utilize, store, and protect the data you share with us when browsing our website, placing an order, or interacting with our customer care services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-foreground">2. Information We Collect</h2>
          <p>When you use Noreh.pk, we may collect the following categories of information:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Personal Identifiers:</strong> Name, phone/WhatsApp number, delivery address, city, and email address provided during checkout or registration.</li>
            <li><strong>Order History:</strong> Details of the items you purchase, order totals, sizing preferences, and transaction records.</li>
            <li><strong>Technical & Browsing Data:</strong> IP address, device type, browser information, pages visited, and cookies necessary for website navigation and shopping cart functionality.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-foreground">3. How We Use Your Information</h2>
          <p>We use your information exclusively for legitimate e-commerce operations, including:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Verifying, fulfilling, and dispatching your orders nationwide.</li>
            <li>Sending order confirmation emails when email delivery is configured and responding to delivery questions.</li>
            <li>Providing prompt customer support for order queries, size advice, or return requests.</li>
            <li>Informing you of exclusive Eid sales, seasonal arrivals, and promotional discounts (only with your subscription consent).</li>
            <li>Improving site navigation, performance, and overall shopping experience.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-foreground">4. Data Sharing & Third Parties</h2>
          <p>
            Noreh.pk <strong className="text-foreground">never sells, rents, or trades</strong> your personal information to third parties. We share only necessary delivery details (name, contact number, shipping address) with our authorized logistics and courier partners (such as Trax, TCS, Call Courier, and Leopards) strictly for the purpose of order fulfillment.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-foreground">5. Data Security</h2>
          <p>
            We implement industry-standard 256-bit SSL encryption and strict administrative safeguards to prevent unauthorized access, loss, or misuse of your personal data.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-foreground">6. Your Rights</h2>
          <p>
            You have the right to request access to the personal data we hold about you, request corrections to inaccurate details, or unsubscribe from marketing emails and SMS notifications at any time. To exercise these rights, please contact our privacy desk at <strong className="text-foreground">support@noreh.pk</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}

