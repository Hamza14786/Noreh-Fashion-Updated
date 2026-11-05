'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store-context';
import { MobileMenu } from './mobile-menu';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'New Arrivals', href: '/new-arrivals' },
  { label: 'Collections', href: '/collections' },
  { label: 'Sale', href: '/sale', highlight: true },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { cartCount, wishlist, openCart, openSearch } = useStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-primary text-primary-foreground overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee py-2 text-xs tracking-[0.2em] uppercase">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex shrink-0">
              <span className="px-8">Free delivery on orders of PKR 5,000 or more</span>
              <span className="px-8">—</span>
              <span className="px-8">Eid Sale: Up to 40% off selected styles</span>
              <span className="px-8">—</span>
              <span className="px-8">New Winter Collection 2026 now available</span>
              <span className="px-8">—</span>
            </div>
          ))}
        </div>
      </div>

      <header
        className={cn(
          'sticky top-0 z-40 transition-all duration-300',
          scrolled
            ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border'
            : 'bg-background border-b border-transparent'
        )}
      >
        <nav className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Left: mobile menu + nav links */}
            <div className="flex items-center gap-6">
              <button
                className="lg:hidden p-1 -ml-1"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <ul className="hidden lg:flex items-center gap-7">
                {navLinks.map((link) => (
                  <li
                    key={link.href}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        'text-sm font-medium tracking-wide transition-colors relative py-2',
                        link.highlight
                          ? 'text-destructive'
                          : 'text-foreground hover:text-accent-foreground',
                        pathname === link.href && 'text-accent-foreground'
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Center: logo */}
            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 font-display text-xl lg:text-2xl font-bold tracking-[0.15em] uppercase"
            >
              <span className="hidden sm:inline">Noreh</span>{' '}
              <span className="text-accent-foreground">.pk</span>
            </Link>

            {/* Right: actions */}
            <div className="flex items-center gap-4 lg:gap-5">
              <button
                onClick={openSearch}
                className="p-1 hover:text-accent-foreground transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              <Link
                href="/account"
                className="hidden sm:block p-1 hover:text-accent-foreground transition-colors"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </Link>
              <Link
                href="/wishlist"
                className="relative p-1 hover:text-accent-foreground transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-semibold rounded-full h-4 w-4 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <button
                onClick={openCart}
                className="relative p-1 hover:text-accent-foreground transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full h-4 w-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>

      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
