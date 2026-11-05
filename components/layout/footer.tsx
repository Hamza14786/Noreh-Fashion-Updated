'use client';

import Link from 'next/link';
import { Instagram, Facebook, Twitter, Youtube } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const footerLinks = {
  Shop: [
    { label: 'Shop All', href: '/shop' },
    { label: 'New Arrivals', href: '/new-arrivals' },
    { label: 'Best Sellers', href: '/best-sellers' },
    { label: 'Sale', href: '/sale' },
  ],
  'Customer Service': [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Shipping', href: '/shipping' },
    { label: 'Returns', href: '/returns' },
    { label: 'Size Guide', href: '/size-guide' },
    { label: 'FAQs', href: '/faq' },
  ],
  About: [
    { label: 'About Us', href: '/about' },
    { label: 'Our Story', href: '/about#our-story' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookie-policy' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xs tracking-[0.3em] uppercase opacity-60 mb-3">Join The List</p>
            <h2 className="font-display text-3xl md:text-4xl mb-4">
              Be the first to discover new collections
            </h2>
            <p className="text-sm opacity-70 mb-8 max-w-md mx-auto">
              Subscribe for exclusive offers, early access to new arrivals, and fashion inspiration delivered to your inbox.
            </p>
            <form
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.querySelector('input') as HTMLInputElement;
                if (input.value) {
                  toast.success('Welcome! You\'re now subscribed to Noreh.pk.');
                  input.value = '';
                }
              }}
            >
              <Input
                type="email"
                placeholder="Enter your email"
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Button type="submit" variant="secondary" className="shrink-0">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs tracking-[0.2em] uppercase opacity-60 mb-4">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm opacity-80 hover:opacity-100 transition-opacity"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <span className="font-display text-lg font-bold tracking-[0.1em] uppercase">
              Noreh.pk
            </span>
            <span className="text-xs opacity-50">
              © {new Date().getFullYear()} Noreh.pk. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" aria-label="Instagram" className="opacity-70 hover:opacity-100 transition-opacity">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Facebook" className="opacity-70 hover:opacity-100 transition-opacity">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Twitter" className="opacity-70 hover:opacity-100 transition-opacity">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" aria-label="YouTube" className="opacity-70 hover:opacity-100 transition-opacity">
              <Youtube className="h-5 w-5" />
            </a>
          </div>

          <div className="flex items-center gap-2 text-xs opacity-60">
            <span>Cash on Delivery available nationwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
