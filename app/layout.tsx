import './globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { StoreProvider } from '@/lib/store-context';
import { SiteNavbar, SiteFooter } from '@/components/layout/site-chrome';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  icons: {
    icon: '/noreh-favicon.svg',
    shortcut: '/noreh-favicon.svg',
  },
  title: {
    default: 'Noreh.pk — Premium Pakistani Women\'s Fashion',
    template: '%s — Noreh.pk',
  },
  description:
    'Discover premium Pakistani women\'s fashion at Noreh.pk. Shop unstitched and stitched lawn suits, formal wear, bridal collection, khaddar, pret, abayas, shoes, handbags and accessories.',
  keywords: [
    'pakistan fashion',
    'lawn suits',
    'khaddar',
    'formal wear',
    'bridal collection',
    'pret wear',
    'abaya',
    'women clothing pakistan',
    'eid collection',
  ],
  openGraph: {
    title: 'Noreh.pk — Premium Pakistani Women\'s Fashion',
    description:
      'Discover premium Pakistani women\'s fashion. Shop lawn suits, formal wear, bridal collection, pret, abayas and more.',
    type: 'website',
    siteName: 'Noreh.pk',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Noreh.pk — Premium Pakistani Women\'s Fashion',
    description: 'Discover premium Pakistani women\'s fashion at Noreh.pk.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <StoreProvider>
          <div className="flex min-h-screen flex-col">
            <SiteNavbar />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
          <Toaster position="top-center" duration={2000} />
        </StoreProvider>
      </body>
    </html>
  );
}
