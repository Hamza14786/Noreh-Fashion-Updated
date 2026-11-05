import Link from 'next/link';
import { ArrowRight, Sparkles, Heart, ShieldCheck, Feather } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { heroImages, editorialImages } from '@/lib/products';

export const metadata = {
  title: 'About Us & Our Story - Noreh.pk',
  description: 'Discover the story behind Noreh.pk — celebrating Pakistani heritage craftsmanship, premium fabrics, and modern women fashion.',
};

export default function AboutPage() {
  const values = [
    {
      icon: Feather,
      title: 'Artisanal Craftsmanship',
      description: 'Every motif and silhouette is thoughtfully sketched and stitched, celebrating centuries of Pakistani textile artistry.',
    },
    {
      icon: Sparkles,
      title: 'Uncompromised Quality',
      description: 'We source only the finest Dhanak, luxury Lawn, Khaddar, and silks, tested rigorously for weave density and color fastness.',
    },
    {
      icon: Heart,
      title: 'Designed for Every Woman',
      description: 'From modest everyday wear to show-stopping wedding ensembles, our designs empower modern women with confidence and grace.',
    },
    {
      icon: ShieldCheck,
      title: 'Ethical & Mindful Creation',
      description: 'We believe in fair wages, respectful working conditions for our artisans, and sustainable packaging that respects our planet.',
    },
  ];

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8 text-center max-w-3xl">
          <p className="text-xs tracking-[0.3em] uppercase opacity-60 mb-4">Our Philosophy</p>
          <h1 className="font-display text-4xl md:text-6xl mb-6">Wear Your Story with Elegance</h1>
          <p className="text-base md:text-lg opacity-80 leading-relaxed max-w-2xl mx-auto">
            Noreh.pk was created for the woman who appreciates timeless eastern craft woven with modern sophistication.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-12">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <span className="text-foreground">About Us</span>
        </nav>

        {/* Our Story Section with Anchor */}
        <section id="our-story" className="scroll-mt-24 mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">Heritage & Vision</p>
              <h2 className="font-display text-3xl md:text-5xl mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-sm md:text-base">
                <p>
                  Founded in Pakistan, <strong className="text-foreground font-semibold">Noreh.pk</strong> was born from a simple yet passionate belief: that fashion should be a harmonious blend of cultural identity, artisanal heritage, and contemporary silhouette.
                </p>
                <p>
                  Inspired by Lahore’s historic royal ateliers and the diverse regional embroideries of Multan, Sindh, and Punjab, our master craftspeople transform raw textiles into poetry. Each unstitched 3-piece suit, graceful abaya, and tailored pret piece reflects meticulous attention to threadwork, embellishments, and shawl drape.
                </p>
                <p>
                  From our studio to your wardrobe, we bridge the gap between traditional royal heirlooms and everyday accessible luxury, ensuring every piece you wear feels unique, comfortable, and enduring.
                </p>
              </div>

              <div className="mt-8 flex gap-4">
                <Button asChild size="lg">
                  <Link href="/shop">
                    Explore Our Collections <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] overflow-hidden rounded-sm bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={editorialImages[0]}
                  alt="Noreh craftmanship"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="aspect-[3/4] overflow-hidden rounded-sm bg-secondary mt-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={editorialImages[1]}
                  alt="Noreh design detail"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Brand Pillars / Values */}
        <section className="border-t border-border pt-16 mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-2">Our Promise</p>
            <h2 className="font-display text-3xl md:text-4xl">What Defines Noreh.pk</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, i) => {
              const Icon = val.icon;
              return (
                <div key={i} className="border border-border p-6 rounded-sm bg-card">
                  <Icon className="h-8 w-8 text-foreground mb-4" />
                  <h3 className="font-display text-lg mb-2">{val.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{val.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Banner CTA */}
        <section className="border border-border rounded-sm bg-secondary/50 p-8 md:p-12 text-center max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-4xl mb-4">Discover The Season&#39;s Most Loved Styles</h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto mb-6">
            Explore unstitched 3-piece Dhanak, printed lawn, and embroidered suits crafted for the modern Pakistani wardrobe.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/new-arrivals">Shop New Arrivals</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Get In Touch</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

