import Link from 'next/link';

export const metadata = {
  title: 'Cookie Policy - Noreh.pk',
  description: 'Understand how Noreh.pk uses cookies and similar technologies to enhance your online shopping experience.',
};

export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground">Cookie Policy</span>
      </nav>

      {/* Header */}
      <div className="max-w-3xl mb-12">
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-2">Transparency & Cookies</p>
        <h1 className="font-display text-4xl md:text-5xl mb-4">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground">
          Last Updated: October 2026 · Explaining how cookies power your shopping experience on Noreh.pk
        </p>
      </div>

      <div className="max-w-3xl space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-display text-xl text-foreground">1. What Are Cookies?</h2>
          <p>
            Cookies are small text files that are stored on your computer, tablet, or smartphone when you visit a website. They allow the website to recognize your device and remember your preferences over time, making your shopping experience smoother and more personalized.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-foreground">2. How Noreh.pk Uses Cookies</h2>
          <p>We use cookies for several vital functions across our store:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-foreground">Essential / Functional Cookies:</strong> Required for the core operation of our e-commerce store, such as remembering items placed in your shopping bag, wishlist data, and account login sessions.
            </li>
            <li>
              <strong className="text-foreground">Performance & Analytics Cookies:</strong> Help us understand which suits, fabrics, and collections are most popular, which pages load fastest, and how visitors navigate our website so we can continually enhance the store.
            </li>
            <li>
              <strong className="text-foreground">Preferences:</strong> Remember your preferred currency display, size selections, and recent search filters across sessions.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-foreground">3. Third-Party Cookies</h2>
          <p>
            We may utilize trusted third-party analytics services (such as Google Analytics) that use cookies to provide anonymized aggregated traffic metrics.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-foreground">4. Managing Your Cookie Preferences</h2>
          <p>
            Most modern web browsers allow you to manage or disable cookies through their settings menu (under Privacy & Security). However, please note that disabling essential cookies may prevent you from adding items to your cart or proceeding through checkout properly.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-foreground">5. Inquiries</h2>
          <p>
            If you have questions regarding our use of cookies or privacy practices, please contact us at <strong className="text-foreground">support@noreh.pk</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}

