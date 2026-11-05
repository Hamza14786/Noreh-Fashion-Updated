import type { Metadata } from 'next';

export const metadata: Metadata = {
  icons: {
    icon: '/admin-favicon.svg',
    shortcut: '/admin-favicon.svg',
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
