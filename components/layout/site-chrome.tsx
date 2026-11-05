'use client';
import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';import { Footer } from './footer';import { CartDrawer } from '@/components/cart/cart-drawer';import { SearchModal } from './search-modal';
export function SiteNavbar(){return usePathname().startsWith('/admin')?null:<Navbar/>;}
export function SiteFooter(){return usePathname().startsWith('/admin')?null:<><Footer/><CartDrawer/><SearchModal/></>;}
