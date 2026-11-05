'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { heroImages, editorialImages, socialImages, products, getNewArrivals, getBestSellers, getSaleProducts } from '@/lib/products';
import { categories, collections } from '@/lib/categories';
import { ProductCard } from '@/components/product/product-card';
import { Rating } from '@/components/product/rating';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const newArrivals = getNewArrivals().slice(0, 8);
  const bestSellers = getBestSellers().slice(0, 4);
  const saleProducts = getSaleProducts().slice(0, 4);
  const featuredCollection = collections[0];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <HeroSection />

      {/* Featured Categories */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
              Explore
            </p>
            <h2 className="font-display text-3xl md:text-5xl">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.slice(0, 8).map((cat, i) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="group relative overflow-hidden aspect-[3/4] bg-secondary"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white drop-shadow-sm">
                  <h3 className="font-display text-lg md:text-xl mb-1">{cat.name}</h3>
                  <p className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                    Explore <ArrowRight className="h-3 w-3" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 lg:py-24 bg-secondary/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
                Just In
              </p>
              <h2 className="font-display text-3xl md:text-5xl">New Arrivals</h2>
            </div>
            <Link
              href="/new-arrivals"
              className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-accent-foreground transition-colors"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-10 md:hidden">
            <Button asChild variant="outline">
              <Link href="/new-arrivals">View All New Arrivals</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="relative overflow-hidden">
        <div className="relative aspect-[16/7] md:aspect-[21/8]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImages.secondary}
            alt="Mid-Season Sale"
            className="w-full h-full object-cover object-center"
            loading="lazy"
            decoding="async"
          />
          {/* Black overlay */}
          <div className="absolute inset-0 bg-black/65" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/70" />
          <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4">
            <div className="drop-shadow-md">
              <p className="text-xs tracking-[0.3em] uppercase opacity-90 font-medium mb-3">
                Limited Time
              </p>
              <h2 className="font-display text-4xl md:text-6xl lg:text-7xl mb-4">
                Mid-Season Sale
              </h2>
              <p className="text-lg md:text-xl opacity-90 mb-8 max-w-md mx-auto">
                Up to 40% off selected styles. Refresh your wardrobe for less.
              </p>
              <Button asChild size="lg" variant="secondary">
                <Link href="/sale">Shop Sale</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
                Most Loved
              </p>
              <h2 className="font-display text-3xl md:text-5xl">Best Sellers</h2>
            </div>
            <Link
              href="/best-sellers"
              className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-accent-foreground transition-colors"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/5] overflow-hidden order-2 lg:order-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featuredCollection.image}
                alt={featuredCollection.name}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="order-1 lg:order-2 lg:pl-8">
              <p className="text-xs tracking-[0.3em] uppercase opacity-60 mb-4">
                {featuredCollection.season}
              </p>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6">
                {featuredCollection.name}
              </h2>
              <p className="text-lg opacity-80 mb-8 max-w-md">
                {featuredCollection.description}
              </p>
              <Button asChild variant="secondary" size="lg">
                <Link href={`/collections/${featuredCollection.slug}`}>
                  Shop Collection <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sale */}
      <FlashSale products={saleProducts} />

      {/* Brand Story */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
                Our Philosophy
              </p>
              <h2 className="font-display text-4xl md:text-5xl mb-6">
                Wear Your Story
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                Noreh.pk was born from a simple belief: that fashion should be a
                reflection of who you are. Every piece in our collection is designed to
                empower, to inspire, and to express the unique story of the woman who wears it.
              </p>
              <p className="text-muted-foreground mb-8">
                From our atelier to your wardrobe, we craft each garment with meticulous
                attention to detail, using only the finest materials and sustainable practices.
                We believe in fashion that lasts — in every sense of the word.
              </p>
              <Button asChild variant="outline" size="lg">
                <Link href="/about">Discover Our Story</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {editorialImages.map((src, i) => (
                <div
                  key={i}
                  className={`overflow-hidden bg-secondary ${i === 0 ? 'aspect-[3/4] mt-8' : 'aspect-[3/4]'}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt="Noreh.pk editorial"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <ReviewsSection />

      {/* Social Section */}
      <section className="py-16 lg:py-24 bg-secondary/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
              Follow Us
            </p>
            <h2 className="font-display text-3xl md:text-5xl mb-2">@noreh.pk</h2>
            <p className="text-sm text-muted-foreground">
              Tag us for a chance to be featured
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
            {socialImages.map((src, i) => (
              <a
                key={i}
                href="#"
                className="group relative overflow-hidden aspect-square bg-secondary"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt="Instagram post"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    View
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const heroSlides = [
  {
    image: '/hero-navy.jpg',
    imageAlt: 'Model wearing a navy embroidered suit with a patterned shawl',
    eyebrow: 'The New Season',
    title: 'Western Wear, Made Modern',
    description:
      'Discover stitched, unstitched, lawn, khaddar, abayas, formals, and accessories inspired by heritage craft.',
  },
  {
    image: '/hero-olive.jpg',
    imageAlt: 'Model wearing an olive embroidered suit with a floral shawl',
    eyebrow: 'Timeless Elegance',
    title: 'Grace in Every Thread',
    description:
      'Explore thoughtfully crafted styles that bring together rich colors, intricate details, and everyday comfort.',
  },
] as const;

function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const showPreviousSlide = () => {
    setActiveSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length);
  };
  const showNextSlide = () => {
    setActiveSlide((current) => (current + 1) % heroSlides.length);
  };

  return (
    <section
      className="relative overflow-hidden h-[70vh] md:h-[85vh] min-h-[500px]"
      aria-label="Featured collections"
      aria-roledescription="carousel"
    >
      {heroSlides.map((slide, index) => (
        <div
          key={slide.image}
          className={`absolute inset-0 transition-opacity duration-700 ${
            activeSlide === index ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          aria-hidden={activeSlide !== index}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.image}
            alt={slide.imageAlt}
            className="absolute inset-0 h-full w-full object-cover object-center"
            fetchPriority={index === 0 ? 'high' : 'auto'}
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

          <div className="relative flex h-full items-center">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="max-w-xl text-white drop-shadow-md">
                <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] opacity-90">
                  {slide.eyebrow}
                </p>
                <h1 className="mb-6 font-display text-5xl leading-[0.95] md:text-7xl lg:text-8xl">
                  {slide.title}
                </h1>
                <p className="mb-8 max-w-lg text-lg leading-relaxed opacity-90 md:text-xl">
                  {slide.description}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" variant="secondary">
                    <Link href="/shop">Shop Collection</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white/50 bg-transparent text-white transition-colors hover:border-white hover:bg-white/20 hover:text-white"
                  >
                    <Link href="/new-arrivals">Explore New Arrivals</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-6 right-4 z-10 flex items-center gap-3 md:bottom-8 md:right-8">
        <div className="flex items-center gap-2" aria-label="Choose a slide">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.image}
              type="button"
              onClick={() => setActiveSlide(index)}
              className={`h-2.5 rounded-full transition-all ${
                activeSlide === index ? 'w-8 bg-white' : 'w-2.5 bg-white/60 hover:bg-white'
              }`}
              aria-label={`Show slide ${index + 1}: ${slide.eyebrow}`}
              aria-current={activeSlide === index ? 'true' : undefined}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={showPreviousSlide}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 text-white transition-colors hover:bg-white/20"
          aria-label="Previous slide"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={showNextSlide}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 text-white transition-colors hover:bg-white/20"
          aria-label="Next slide"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

function FlashSale({ products: saleProducts }: { products: typeof products }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 34, seconds: 56 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <section className="py-16 lg:py-24 bg-accent/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-destructive mb-3">
            <Clock className="h-4 w-4" />
            <span className="text-xs tracking-[0.3em] uppercase font-medium">Flash Sale</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl mb-4">Limited Time Offers</h2>
          <div className="inline-flex items-center gap-2 md:gap-4 font-display text-3xl md:text-5xl">
            <div className="flex flex-col items-center">
              <span className="bg-foreground text-background px-3 py-2 md:px-4 md:py-3 rounded-sm">
                {pad(timeLeft.hours)}
              </span>
              <span className="text-xs mt-1 text-muted-foreground">Hours</span>
            </div>
            <span className="text-muted-foreground">:</span>
            <div className="flex flex-col items-center">
              <span className="bg-foreground text-background px-3 py-2 md:px-4 md:py-3 rounded-sm">
                {pad(timeLeft.minutes)}
              </span>
              <span className="text-xs mt-1 text-muted-foreground">Mins</span>
            </div>
            <span className="text-muted-foreground">:</span>
            <div className="flex flex-col items-center">
              <span className="bg-foreground text-background px-3 py-2 md:px-4 md:py-3 rounded-sm">
                {pad(timeLeft.seconds)}
              </span>
              <span className="text-xs mt-1 text-muted-foreground">Secs</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {saleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Button asChild size="lg">
            <Link href="/sale">Shop All Sale</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function ReviewsSection() {
  const reviews = [
    { author: 'Ayesha Khan', location: 'Lahore, Pakistan', rating: 5, comment: 'The quality is absolutely exceptional. Every piece I\'ve ordered feels luxurious and fits perfectly. Noreh.pk has become my go-to for Eid and weddings.', product: 'Royal Embroidered Formal Suit', date: 'July 2026' },
    { author: 'Fatima Siddiqui', location: 'Karachi, Pakistan', rating: 5, comment: 'I\'ve been searching for modest fashion that doesn\'t compromise on style. The abaya collection is stunning — elegant, modern, and beautifully crafted.', product: 'Embroidered Black Abaya', date: 'June 2026' },
    { author: 'Zainab Malik', location: 'Islamabad, Pakistan', rating: 5, comment: 'The attention to detail is incredible. From the packaging to the fabric quality, everything feels premium. The lawn suit is a wardrobe staple now.', product: 'Premium Lawn Suit', date: 'June 2026' },
  ];

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
            What Our Customers Say
          </p>
          <h2 className="font-display text-3xl md:text-5xl">Loved by Thousands</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {reviews.map((review, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-sm p-6 md:p-8 flex flex-col"
            >
              <Rating rating={review.rating} showCount={false} size="md" />
              <p className="text-sm md:text-base text-foreground/80 mt-4 mb-6 flex-1 italic">
                &ldquo;{review.comment}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-medium text-sm">
                  {review.author.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{review.author}</p>
                  <p className="text-xs text-muted-foreground">{review.location}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Purchased: <span className="text-foreground">{review.product}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">{review.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
