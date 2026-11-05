'use client';

import Image from 'next/image';
import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle, ArrowDownToLine, ArrowRight, Box, Check, ChevronDown, Clock3,
  ImagePlus, LayoutDashboard, LoaderCircle, LogOut, Menu, Package, Plus,
  RefreshCw, Search, ShoppingBag, Trash2, X,
} from 'lucide-react';
import { categories } from '@/lib/categories';

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  gender: string;
  collection: string;
  brand: string;
  price: number;
  salePrice?: number;
  stock: number;
  sku: string;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  tags: string[];
  featured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  material: string;
  careInstructions: string;
  shippingInfo: string;
  returnPolicy: string;
};

type OrderItem = { productId: string; name: string; sku?: string; image?: string; size?: string; color?: string; quantity: number; unitPrice: number; lineTotal: number };
type Order = {
  order_number: string;
  customer: { name: string; email: string; phone: string };
  shipping: { address: string; city: string; postal: string; country: string };
  items: OrderItem[];
  subtotal: number;
  shipping_total: number;
  tax: number;
  total: number;
  status: string;
  payment_method: string;
  delivery_method: string;
  created_at: string;
};
type Overview = { products: number; orders: number; pending: number; completed: number; recent: Order[] };
type Section = 'Overview' | 'Products' | 'Orders';

const inputClass = 'mt-1 w-full rounded border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-200 disabled:bg-stone-100';
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50';
const navItems: { name: Section; icon: typeof LayoutDashboard }[] = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Products', icon: Package },
  { name: 'Orders', icon: ShoppingBag },
];
const orderTransitions: Record<string, string[]> = {
  pending: ['pending', 'processing', 'cancelled'],
  processing: ['processing', 'shipped', 'cancelled'],
  shipped: ['shipped', 'completed'],
  completed: ['completed'],
  cancelled: ['cancelled'],
};

const productColorOptions: Product['colors'] = [
  { name: 'Black', hex: '#171717' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Maroon', hex: '#741f35' },
  { name: 'Burgundy', hex: '#6e1827' },
  { name: 'Red', hex: '#c62828' },
  { name: 'Pink', hex: '#e7a9ba' },
  { name: 'Magenta', hex: '#a81762' },
  { name: 'Coral', hex: '#e98269' },
  { name: 'Orange', hex: '#ed6c24' },
  { name: 'Mustard', hex: '#c28a12' },
  { name: 'Yellow', hex: '#f2d43d' },
  { name: 'Beige', hex: '#d9c9a9' },
  { name: 'Camel', hex: '#a8783f' },
  { name: 'Brown', hex: '#4d3025' },
  { name: 'Rust', hex: '#a9472f' },
  { name: 'Olive', hex: '#56552a' },
  { name: 'Green', hex: '#34734a' },
  { name: 'Dark Green', hex: '#17452b' },
  { name: 'Teal', hex: '#168b83' },
  { name: 'Sky Blue', hex: '#72b7d2' },
  { name: 'Blue', hex: '#3569a8' },
  { name: 'Navy', hex: '#172644' },
  { name: 'Purple', hex: '#6655b5' },
  { name: 'Plum', hex: '#84205b' },
  { name: 'Grey', hex: '#858585' },
  { name: 'Silver', hex: '#b9bec4' },
  { name: 'Gold', hex: '#c7a34b' },
];
const productSizeOptions = [
  { value: 'S', label: 'Small (S)' },
  { value: 'M', label: 'Medium (M)' },
  { value: 'L', label: 'Large (L)' },
  { value: 'XL', label: 'Extra large (XL)' },
];

const blankProduct = (): Product => ({
  id: '', name: '', slug: '', description: '', category: 'lawn-suits', gender: 'women',
  collection: '', brand: 'Noreh.pk', price: 0, salePrice: undefined, stock: 0, sku: '',
  images: [], colors: [], sizes: ['S', 'M', 'L', 'XL'], tags: [], featured: false, isNewArrival: false,
  isBestSeller: false, material: '', careInstructions: '', shippingInfo: '', returnPolicy: '',
});

function money(value: number) {
  return `PKR ${Number(value || 0).toLocaleString('en-PK')}`;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...init, credentials: 'same-origin' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || `Request failed (${response.status})`);
  return payload as T;
}

function LoadingMark({ label = 'Loading' }: { label?: string }) {
  return <span className="inline-flex items-center gap-2 text-sm text-stone-500"><LoaderCircle className="animate-spin" size={16} aria-hidden="true"/>{label}</span>;
}

function Notice({ message, kind = 'success', onClose }: { message: string; kind?: 'success' | 'error'; onClose: () => void }) {
  return <div role={kind === 'error' ? 'alert' : 'status'} className={`mb-6 flex items-start justify-between gap-4 border px-4 py-3 text-sm ${kind === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`}>
    <span className="flex items-center gap-2">{kind === 'error' ? <AlertCircle size={17}/> : <Check size={17}/>} {message}</span>
    <button type="button" onClick={onClose} aria-label="Dismiss message"><X size={16}/></button>
  </div>;
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="block text-xs font-medium text-stone-700">{label}{children}{hint && <span className="mt-1 block font-normal text-stone-500">{hint}</span>}</label>;
}

export default function AdminDashboard() {
  const [auth, setAuth] = useState<'checking' | 'signed-out' | 'signed-in'>('checking');
  const [login, setLogin] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [section, setSection] = useState<Section>('Overview');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState<{ text: string; kind: 'success' | 'error' } | null>(null);
  const [editor, setEditor] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyOrder, setBusyOrder] = useState('');
  const [busyProduct, setBusyProduct] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoadingData(true);
    setLoadError('');
    try {
      const [nextOverview, nextProducts, nextOrders] = await Promise.all([
        api<Overview>('/api/admin/overview'),
        api<Product[]>('/api/admin/products'),
        api<Order[]>('/api/admin/orders'),
      ]);
      setOverview(nextOverview);
      setProducts(nextProducts);
      setOrders(nextOrders);
      setAuth('signed-in');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load dashboard data';
      if (message === 'Unauthorized') setAuth('signed-out');
      else { setAuth('signed-in'); setLoadError(message); }
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/admin/session', { credentials: 'same-origin' })
      .then(async response => {
        if (response.status === 401) return { authenticated: false };
        const session = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(session?.error || 'Could not check admin session');
        return session as { authenticated: boolean };
      })
      .then(session => {
        if (!active) return;
        if (session.authenticated) void loadDashboard();
        else setAuth('signed-out');
      })
      .catch(error => {
        if (active) {
          setAuth('signed-out');
          setLoginError(error instanceof Error ? error.message : 'Could not check admin session');
        }
      });
    return () => { active = false; };
  }, [loadDashboard]);

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products;
    return products.filter(product => [product.name, product.sku, product.category].some(value => value?.toLowerCase().includes(term)));
  }, [products, query]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError('');
    setSaving(true);
    try {
      await api('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(login) });
      setLogin(value => ({ ...value, password: '' }));
      await loadDashboard();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Sign in failed');
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    try { await api('/api/admin/logout', { method: 'POST' }); } catch { /* Expired sessions can still be cleared locally. */ }
    finally {
      setAuth('signed-out');
      setOverview(null);
      setProducts([]);
      setOrders([]);
      setLogin(value => ({ ...value, password: '' }));
      setSection('Overview');
    }
  }

  function flash(text: string, kind: 'success' | 'error' = 'success') {
    setNotice({ text, kind });
  }

  async function saveProduct(product: Product) {
    setSaving(true);
    try {
      const body = { ...product, salePrice: product.salePrice ?? null };
      await api<Product>(product.id ? `/api/admin/products/${product.id}` : '/api/admin/products', {
        method: product.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      setEditor(null);
      flash('Product saved.');
      await loadDashboard();
    } catch (error) {
      flash(error instanceof Error ? error.message : 'Could not save product.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct(product: Product) {
    if (!window.confirm(`Delete “${product.name}”? This cannot be undone.`)) return;
    setBusyProduct(product.id);
    try {
      await api(`/api/admin/products/${product.id}`, { method: 'DELETE' });
      flash('Product deleted.');
      await loadDashboard();
    } catch (error) {
      flash(error instanceof Error ? error.message : 'Could not delete product.', 'error');
    } finally {
      setBusyProduct('');
    }
  }

  async function saveStock(product: Product, stock: number) {
    setBusyProduct(product.id);
    try {
      await api(`/api/admin/products/${product.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, stock }),
      });
      flash(`Stock updated for ${product.name}.`);
      await loadDashboard();
    } catch (error) {
      flash(error instanceof Error ? error.message : 'Could not update stock.', 'error');
    } finally {
      setBusyProduct('');
    }
  }

  async function updateOrder(order: Order, status: string) {
    setBusyOrder(order.order_number);
    try {
      await api(`/api/admin/orders/${encodeURIComponent(order.order_number)}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
      });
      flash(`Order ${order.order_number} updated to ${status}.`);
      await loadDashboard();
      setSelectedOrder(current => current?.order_number === order.order_number ? { ...current, status } : current);
    } catch (error) {
      flash(error instanceof Error ? error.message : 'Could not update order.', 'error');
    } finally {
      setBusyOrder('');
    }
  }

  async function retryNotification(order: Order) {
    setBusyOrder(order.order_number);
    try {
      const result = await api<{ sent: boolean }>('/api/admin/orders/' + encodeURIComponent(order.order_number) + '/notification', { method: 'POST' });
      flash(result.sent ? `Notification for ${order.order_number} is sent.` : `Notification for ${order.order_number} is still queued.`, result.sent ? 'success' : 'error');
    } catch (error) {
      flash(error instanceof Error ? error.message : 'Could not retry the notification.', 'error');
    } finally {
      setBusyOrder('');
    }
  }

  if (auth === 'checking') return <div className="flex min-h-screen items-center justify-center bg-[#f6f5f2]"><LoadingMark label="Checking your admin session"/></div>;

  if (auth === 'signed-out') return <main className="flex min-h-screen items-center justify-center bg-[#f4f1eb] px-4 py-10">
    <form onSubmit={signIn} className="w-full max-w-md border border-stone-200 bg-white p-7 shadow-sm sm:p-10">
      <div className="mb-9 flex items-center gap-3"><span className="bg-stone-900 p-2 text-white"><Box size={19}/></span><div><p className="text-[10px] uppercase tracking-[.22em] text-stone-500">Noreh.pk</p><p className="font-display text-xl">Store administration</p></div></div>
      <h1 className="font-display text-3xl">Welcome back</h1><p className="mb-7 mt-2 text-sm text-stone-500">Sign in to manage your store.</p>
      {loginError && <p role="alert" className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-800">{loginError}</p>}
      <Field label="Email"><input className={inputClass} type="email" autoComplete="username" required maxLength={254} value={login.email} onChange={event => setLogin({ ...login, email: event.target.value })}/></Field>
      <Field label="Password"><input className={inputClass} type="password" autoComplete="current-password" required maxLength={1024} value={login.password} onChange={event => setLogin({ ...login, password: event.target.value })}/></Field>
      <button className={`${buttonClass} mt-6 w-full bg-stone-900 text-white hover:bg-stone-700`} disabled={saving}>{saving ? <><LoaderCircle className="animate-spin" size={16}/> Signing in</> : 'Sign in'}</button>
    </form>
  </main>;

  const lowStockCount = products.filter(product => product.stock <= 5).length;
  return <div className="min-h-screen bg-[#f6f5f2] text-stone-900 md:flex">
    <aside className="hidden w-64 shrink-0 bg-[#211f1d] p-5 text-white md:flex md:min-h-screen md:flex-col">
      <Brand/>
      <p className="mb-3 mt-7 px-3 text-[10px] uppercase tracking-[.2em] text-stone-500">Store</p>
      <Navigation section={section} onSelect={setSection}/>
      <div className="mt-auto border-t border-white/10 pt-4"><button onClick={signOut} className="flex w-full items-center gap-3 px-3 py-3 text-sm text-stone-400 transition hover:text-white"><LogOut size={17}/>Sign out</button><p className="px-3 text-[11px] text-stone-600">Admin session · secure cookie</p></div>
    </aside>

    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-[#f6f5f2]/95 px-4 py-3 backdrop-blur md:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3"><button type="button" onClick={() => setMobileNavOpen(!mobileNavOpen)} className="rounded p-2 text-stone-600 hover:bg-stone-200 md:hidden" aria-label="Toggle navigation"><Menu size={20}/></button><div className="md:hidden"><Brand compact/></div><div className="hidden md:block"><p className="text-xs text-stone-500">Store management / {section}</p><h1 className="mt-0.5 font-display text-2xl">{section}</h1></div></div>
          <div className="flex items-center gap-2"><span className="hidden text-xs text-stone-500 sm:inline">Noreh.pk · Admin</span><button type="button" onClick={() => void loadDashboard()} disabled={loadingData} className={`${buttonClass} border border-stone-300 bg-white px-3 text-stone-700 hover:bg-stone-50`}><RefreshCw size={15} className={loadingData ? 'animate-spin' : ''}/><span className="hidden sm:inline">Refresh</span></button><button type="button" onClick={signOut} className={`${buttonClass} px-3 text-stone-600 hover:bg-stone-200 md:hidden`} aria-label="Sign out"><LogOut size={17}/></button></div>
        </div>
        {mobileNavOpen && <div className="mt-3 border-t border-stone-200 pt-3 md:hidden"><Navigation section={section} onSelect={value => { setSection(value); setMobileNavOpen(false); }}/><button onClick={signOut} className="mt-2 flex w-full items-center gap-3 px-3 py-3 text-sm text-stone-500"><LogOut size={17}/>Sign out</button></div>}
      </header>

      <main className="mx-auto max-w-[1500px] p-4 sm:p-6 md:p-8">
        <div className="mb-6 flex items-end justify-between gap-4 md:hidden"><div><p className="text-xs text-stone-500">Store management</p><h1 className="font-display text-3xl">{section}</h1></div></div>
        {notice && <Notice message={notice.text} kind={notice.kind} onClose={() => setNotice(null)}/>}
        {loadError && <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-800"><span className="flex items-center gap-2"><AlertCircle size={17}/>{loadError}</span><button onClick={() => void loadDashboard()} className="underline">Try again</button></div>}
        {loadingData && !overview ? <div className="border border-stone-200 bg-white p-10 text-center"><LoadingMark label="Loading store data"/></div> : <>
          {section === 'Overview' && <OverviewPanel overview={overview} orders={orders} lowStockCount={lowStockCount} loading={loadingData} onOpenOrder={setSelectedOrder} onStatus={updateOrder} busyOrder={busyOrder} onSection={setSection}/>}
          {section === 'Products' && <ProductsPanel products={filteredProducts} query={query} onQuery={setQuery} onAdd={() => setEditor(blankProduct())} onEdit={setEditor} onDelete={removeProduct} onStock={saveStock} busyProduct={busyProduct} loading={loadingData}/>}
          {section === 'Orders' && <OrdersPanel orders={orders} onOpen={setSelectedOrder} onStatus={updateOrder} busyOrder={busyOrder}/>}
        </>}
      </main>
    </div>

    {editor && <ProductEditor key={editor.id || 'new-product'} initial={editor} saving={saving} onClose={() => setEditor(null)} onSave={saveProduct} onError={message => flash(message, 'error')}/>}
    {selectedOrder && <OrderDetails order={selectedOrder} busy={busyOrder === selectedOrder.order_number} onClose={() => setSelectedOrder(null)} onStatus={status => void updateOrder(selectedOrder, status)} onRetryNotification={() => void retryNotification(selectedOrder)}/>}
  </div>;
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-3"><span className="bg-white/10 p-2 text-white"><Box size={compact ? 17 : 20}/></span><div><p className="text-[10px] tracking-[.24em] text-stone-400">NOREH.PK</p><p className={`font-display ${compact ? 'text-base' : 'text-lg'}`}>Admin Studio</p></div></div>;
}

function Navigation({ section, onSelect }: { section: Section; onSelect: (section: Section) => void }) {
  return <nav aria-label="Admin sections" className="flex gap-1 md:flex-col">{navItems.map(({ name, icon: Icon }) => <button key={name} type="button" aria-current={section === name ? 'page' : undefined} onClick={() => onSelect(name)} className={`flex items-center gap-3 px-3 py-3 text-left text-sm transition ${section === name ? 'bg-white/10 text-white' : 'text-stone-400 hover:bg-white/5 hover:text-white'} ${name === 'Overview' ? '' : ''} md:w-full`}><Icon size={17}/>{name}</button>)}</nav>;
}

function MetricCard({ label, value, icon: Icon, note, tone = 'stone' }: { label: string; value: string | number; icon: typeof Package; note?: string; tone?: 'stone' | 'amber' }) {
  return <article className="border border-stone-200 bg-white p-5"><div className="flex items-start justify-between"><p className="text-sm text-stone-500">{label}</p><span className={`rounded-full p-2 ${tone === 'amber' ? 'bg-amber-50 text-amber-800' : 'bg-stone-100 text-stone-600'}`}><Icon size={17}/></span></div><p className="mt-4 font-display text-3xl">{value}</p>{note && <p className="mt-1 text-xs text-stone-500">{note}</p>}</article>;
}

function OverviewPanel({ overview, orders, lowStockCount, loading, onOpenOrder, onStatus, busyOrder, onSection }: {
  overview: Overview | null; orders: Order[]; lowStockCount: number; loading: boolean;
  onOpenOrder: (order: Order) => void; onStatus: (order: Order, status: string) => void;
  busyOrder: string; onSection: (section: Section) => void;
}) {
  const recent = overview?.recent?.length ? overview.recent : orders.slice(0, 6);
  return <div className="space-y-7">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Products" value={overview?.products ?? '—'} icon={Package} note="In your catalog"/>
      <MetricCard label="Orders" value={overview?.orders ?? '—'} icon={ShoppingBag} note="All-time orders"/>
      <MetricCard label="Pending" value={overview?.pending ?? '—'} icon={Clock3} note="Awaiting processing" tone="amber"/>
      <MetricCard label="Low stock" value={lowStockCount} icon={ArrowDownToLine} note="5 units or fewer" tone={lowStockCount ? 'amber' : 'stone'}/>
    </div>
    <section className="border border-stone-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 px-5 py-4"><div><h2 className="font-display text-xl">Recent orders</h2><p className="mt-1 text-xs text-stone-500">Latest activity from your store</p></div><button onClick={() => onSection('Orders')} className="inline-flex items-center gap-2 text-sm text-stone-700 hover:text-black">All orders <ArrowRight size={15}/></button></div>
      {loading && !recent.length ? <div className="p-6"><LoadingMark/></div> : <OrderTable orders={recent.slice(0, 8)} onOpen={onOpenOrder} onStatus={onStatus} busyOrder={busyOrder} compact/>}
    </section>
  </div>;
}

function ProductsPanel({ products, query, onQuery, onAdd, onEdit, onDelete, onStock, busyProduct, loading }: {
  products: Product[]; query: string; onQuery: (query: string) => void; onAdd: () => void;
  onEdit: (product: Product) => void; onDelete: (product: Product) => void;
  onStock: (product: Product, stock: number) => void; busyProduct: string; loading: boolean;
}) {
  return <section className="space-y-4">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="font-display text-2xl">Product catalog</h2><p className="mt-1 text-sm text-stone-500">Edit products, pricing and available inventory.</p></div><button type="button" onClick={onAdd} className={`${buttonClass} bg-stone-900 text-white hover:bg-stone-700`}><Plus size={16}/> Add product</button></div>
    <div className="flex flex-col gap-3 border border-stone-200 bg-white p-3 sm:flex-row sm:items-center"><div className="relative flex-1"><Search size={16} className="absolute left-3 top-3 text-stone-400"/><input className={`${inputClass} mt-0 pl-9`} value={query} onChange={event => onQuery(event.target.value)} placeholder="Search by name, SKU or category" aria-label="Search products"/></div><span className="px-1 text-xs text-stone-500">{products.length} products</span></div>
    <div className="overflow-hidden border border-stone-200 bg-white">
      {loading && !products.length ? <div className="p-8"><LoadingMark label="Loading products"/></div> : products.length ? <>
        <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[820px] text-left text-sm"><thead className="bg-stone-50 text-[11px] uppercase tracking-wide text-stone-500"><tr><th className="px-5 py-3">Product</th><th className="px-4 py-3">SKU</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Inventory</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody>{products.map(product => <ProductRow key={product.id} product={product} onEdit={onEdit} onDelete={onDelete} onStock={onStock} busy={busyProduct === product.id}/>)}</tbody></table></div>
        <div className="divide-y divide-stone-200 md:hidden">{products.map(product => <ProductCard key={product.id} product={product} onEdit={onEdit} onDelete={onDelete} onStock={onStock} busy={busyProduct === product.id}/>)}</div>
      </> : <EmptyState title={query ? 'No matching products' : 'No products yet'} message={query ? 'Try a different name, SKU or category.' : 'Add a product to begin managing your catalog.'} action={!query ? <button onClick={onAdd} className={`${buttonClass} bg-stone-900 text-white`}><Plus size={16}/> Add product</button> : undefined}/ >}
    </div>
  </section>;
}

function ProductRow({ product, onEdit, onDelete, onStock, busy }: { product: Product; onEdit: (product: Product) => void; onDelete: (product: Product) => void; onStock: (product: Product, stock: number) => void; busy: boolean }) {
  const [stock, setStock] = useState(product.stock);
  useEffect(() => setStock(product.stock), [product.stock]);
  return <tr className="border-t border-stone-100"><td className="px-5 py-3"><div className="flex items-center gap-3"><ProductThumb product={product}/><div className="min-w-0"><p className="truncate font-medium">{product.name}</p><p className="mt-1 text-xs text-stone-500">{categoryName(product.category)}</p></div></div></td><td className="px-4 py-3 text-xs text-stone-500">{product.sku}</td><td className="px-4 py-3"><Price product={product}/></td><td className="px-4 py-3"><div className="flex items-center gap-2"><input type="number" min="0" max="1000000" value={stock} onChange={event => setStock(Number(event.target.value))} aria-label={`Stock for ${product.name}`} className="w-20 rounded border border-stone-200 px-2 py-1.5 text-sm"/><button onClick={() => onStock(product, stock)} disabled={busy || stock === product.stock || !Number.isInteger(stock) || stock < 0} className="text-xs text-stone-600 underline disabled:no-underline">{busy ? 'Saving' : 'Save'}</button>{product.stock <= 5 && <span className="rounded bg-amber-50 px-2 py-1 text-[10px] text-amber-800">Low</span>}</div></td><td className="px-5 py-3"><div className="flex justify-end gap-2"><button onClick={() => onEdit(product)} className="rounded border border-stone-300 px-3 py-1.5 text-xs hover:bg-stone-50">Edit</button><button onClick={() => onDelete(product)} disabled={busy} aria-label={`Delete ${product.name}`} className="rounded p-2 text-stone-500 hover:bg-red-50 hover:text-red-700"><Trash2 size={16}/></button></div></td></tr>;
}

function ProductCard({ product, onEdit, onDelete, onStock, busy }: { product: Product; onEdit: (product: Product) => void; onDelete: (product: Product) => void; onStock: (product: Product, stock: number) => void; busy: boolean }) {
  const [stock, setStock] = useState(product.stock);
  useEffect(() => setStock(product.stock), [product.stock]);
  return <article className="p-4"><div className="flex gap-3"><ProductThumb product={product} large/><div className="min-w-0 flex-1"><p className="font-medium">{product.name}</p><p className="mt-1 text-xs text-stone-500">{product.sku} · {categoryName(product.category)}</p><div className="mt-2"><Price product={product}/></div></div></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-2 text-xs text-stone-500">Stock<input type="number" min="0" max="1000000" value={stock} onChange={event => setStock(Number(event.target.value))} className="w-20 rounded border border-stone-200 px-2 py-2 text-sm text-stone-900" aria-label={`Stock for ${product.name}`}/><button onClick={() => onStock(product, stock)} disabled={busy || stock === product.stock || !Number.isInteger(stock) || stock < 0} className="underline disabled:no-underline">Save</button></label><div className="flex gap-2"><button onClick={() => onEdit(product)} className="rounded border border-stone-300 px-3 py-2 text-xs">Edit</button><button onClick={() => onDelete(product)} disabled={busy} className="rounded p-2 text-red-700" aria-label={`Delete ${product.name}`}><Trash2 size={16}/></button></div></div></article>;
}

function ProductThumb({ product, large = false }: { product: Product; large?: boolean }) {
  const size = large ? 'h-20 w-16' : 'h-14 w-11';
  return <div className={`${size} relative shrink-0 overflow-hidden bg-stone-100`}>{product.images?.[0] ? <Image src={product.images[0]} alt={product.name} fill sizes="64px" className="object-cover" unoptimized/> : <div className="flex h-full items-center justify-center text-stone-400"><Package size={19}/></div>}</div>;
}

function Price({ product }: { product: Product }) {
  return <div className="text-sm">{product.salePrice != null ? <><span className="font-medium">{money(product.salePrice)}</span><span className="ml-2 text-xs text-stone-400 line-through">{money(product.price)}</span></> : <span className="font-medium">{money(product.price)}</span>}</div>;
}

function ProductEditor({ initial, saving, onClose, onSave, onError }: { initial: Product; saving: boolean; onClose: () => void; onSave: (product: Product) => void; onError: (message: string) => void }) {
  const [form, setForm] = useState<Product>(() => ({ ...blankProduct(), ...initial, images: initial.images || [], colors: initial.colors || [], sizes: initial.sizes || [], tags: initial.tags || [] }));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(initial.sizes?.length ? initial.sizes : productSizeOptions.map(size => size.value));
  const [tagsText, setTagsText] = useState((initial.tags || []).join(', '));

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) { if (event.key === 'Escape' && !saving && !uploading) onClose(); }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, saving, uploading]);

  function change<K extends keyof Product>(key: K, value: Product[K]) { setForm(current => ({ ...current, [key]: value })); }

  async function uploadFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    if (form.images.length + files.length > 8) { setUploadError('A product can have up to 8 images.'); return; }
    setUploadError('');
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('Choose JPEG, PNG or WebP images up to 5 MB each.');
        const body = new FormData();
        body.append('file', file);
        const result = await api<{ url: string }>('/api/admin/upload', { method: 'POST', body });
        urls.push(result.url);
      }
      setForm(current => ({ ...current, images: [...current.images, ...urls] }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Image upload failed.';
      setUploadError(message);
      onError(message);
    } finally {
      setUploading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setJsonError('');
    const salePrice = form.salePrice === undefined || form.salePrice === null || Number.isNaN(Number(form.salePrice)) ? undefined : Number(form.salePrice);
    if (salePrice !== undefined && (salePrice < 0 || salePrice >= Number(form.price))) { setJsonError('Sale price must be less than the regular price.'); return; }
    onSave({ ...form, price: Number(form.price), stock: Number(form.stock), salePrice, sizes: selectedSizes, tags: tagsText.split(',').map(value => value.trim()).filter(Boolean) });
  }

  return <div className="fixed inset-0 z-40 overflow-y-auto bg-black/45 p-3 sm:p-6" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <form onSubmit={submit} role="dialog" aria-modal="true" aria-label={form.id ? 'Edit product' : 'Add product'} className="mx-auto my-3 max-w-4xl border border-stone-200 bg-[#fbfaf8] shadow-xl sm:my-8">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-[#fbfaf8] px-5 py-4 sm:px-7"><div><p className="text-[10px] uppercase tracking-[.2em] text-stone-500">Catalog</p><h2 className="font-display text-2xl">{form.id ? 'Edit product' : 'Add product'}</h2></div><button type="button" onClick={onClose} className="rounded p-2 text-stone-500 hover:bg-stone-200" aria-label="Close product editor"><X size={20}/></button></div>
      <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Product name *"><input required minLength={2} maxLength={180} className={inputClass} value={form.name} onChange={event => change('name', event.target.value)}/></Field>
            <Field label="SKU *"><input required maxLength={80} className={inputClass} value={form.sku} onChange={event => change('sku', event.target.value)}/></Field>
            <Field label="Category *"><select required className={inputClass} value={form.category} onChange={event => change('category', event.target.value)}>{categories.map(category => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select></Field>
            <Field label="Gender"><select className={inputClass} value={form.gender || 'women'} onChange={event => change('gender', event.target.value)}>{['women', 'men', 'kids'].map(value => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select></Field>
            <Field label="Regular price (PKR) *"><input type="number" required min="0" max="2147483647" step="1" className={inputClass} value={form.price} onChange={event => change('price', Number(event.target.value))}/></Field>
            <Field label="Sale price (optional)"><input type="number" min="0" max="2147483647" step="1" className={inputClass} value={form.salePrice ?? ''} onChange={event => change('salePrice', event.target.value === '' ? undefined : Number(event.target.value))}/></Field>
            <Field label="Stock on hand *"><input type="number" required min="0" max="1000000" step="1" className={inputClass} value={form.stock} onChange={event => change('stock', Number(event.target.value))}/></Field>
            <Field label="URL slug"><input maxLength={180} className={inputClass} value={form.slug} placeholder="Generated from product name" onChange={event => change('slug', event.target.value)}/></Field>
            <Field label="Collection"><input maxLength={120} className={inputClass} value={form.collection || ''} onChange={event => change('collection', event.target.value)}/></Field>
            <Field label="Brand"><input maxLength={120} className={inputClass} value={form.brand || 'Noreh.pk'} onChange={event => change('brand', event.target.value)}/></Field>
          </div>
          <Field label="Description"><textarea maxLength={10000} rows={4} className={inputClass} value={form.description || ''} onChange={event => change('description', event.target.value)}/></Field>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Available sizes" hint="Customers can choose these sizes"><div className="mt-2 flex flex-wrap gap-2">{productSizeOptions.map(size => <label key={size.value} className={`inline-flex cursor-pointer items-center gap-2 rounded border px-3 py-2 text-sm ${selectedSizes.includes(size.value) ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 bg-white text-stone-700'}`}><input type="checkbox" checked={selectedSizes.includes(size.value)} onChange={event => setSelectedSizes(current => event.target.checked ? [...current, size.value] : current.filter(value => value !== size.value))} className="accent-white"/>{size.label}</label>)}</div></Field><Field label="Tags" hint="Comma-separated"><input className={inputClass} value={tagsText} onChange={event => setTagsText(event.target.value)}/></Field></div>
          <Field label="Colors" hint="Choose one or more colors; select another to add it.">
            <select className={inputClass} value="" onChange={event => {
              const selected = productColorOptions.find(color => color.name === event.target.value);
              if (selected && !form.colors.some(color => color.name === selected.name)) change('colors', [...form.colors, selected]);
            }}>
              <option value="">Choose a color</option>
              {productColorOptions.map(color => <option key={color.name} value={color.name}>{color.name}</option>)}
            </select>
            {form.colors.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{form.colors.map(color => <span key={color.name} className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white py-1 pl-2 pr-1 text-xs"><span aria-hidden="true" className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: color.hex }}/>{color.name}<button type="button" onClick={() => change('colors', form.colors.filter(item => item.name !== color.name))} className="ml-1 rounded-full px-1 text-stone-500 hover:bg-stone-100" aria-label={`Remove ${color.name}`}>×</button></span>)}</div>}
          </Field>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Material"><input className={inputClass} value={form.material || ''} onChange={event => change('material', event.target.value)}/></Field><Field label="Care instructions"><input className={inputClass} value={form.careInstructions || ''} onChange={event => change('careInstructions', event.target.value)}/></Field><Field label="Shipping info"><input className={inputClass} value={form.shippingInfo || ''} onChange={event => change('shippingInfo', event.target.value)}/></Field><Field label="Return policy"><input className={inputClass} value={form.returnPolicy || ''} onChange={event => change('returnPolicy', event.target.value)}/></Field></div>
          <div className="flex flex-wrap gap-4 border-t border-stone-200 pt-4">{([['featured', 'Featured'], ['isNewArrival', 'New arrival'], ['isBestSeller', 'Best seller']] as const).map(([key, label]) => <label key={key} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(form[key])} onChange={event => change(key, event.target.checked)}/>{label}</label>)}</div>
        </div>
        <aside className="space-y-3">
          <div><h3 className="font-medium">Product images</h3><p className="mt-1 text-xs text-stone-500">JPEG, PNG or WebP · up to 5 MB each, 8 images maximum.</p></div>
          <label className={`${buttonClass} w-full cursor-pointer border border-dashed border-stone-300 bg-white text-stone-700 hover:border-stone-500`}><ImagePlus size={17}/>{uploading ? 'Uploading images…' : 'Choose images'}<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={uploading || form.images.length >= 8} onChange={uploadFiles} className="sr-only"/></label>
          {uploading && <LoadingMark label="Uploading and optimizing"/>}{uploadError && <p role="alert" className="text-xs text-red-700">{uploadError}</p>}
          <div className="grid grid-cols-2 gap-2">{form.images.map((src, index) => <div key={`${src}-${index}`} className="relative aspect-[4/5] overflow-hidden bg-stone-100"><Image src={src} alt={`${form.name || 'Product'} image ${index + 1}`} fill sizes="140px" className="object-cover" unoptimized/><button type="button" onClick={() => change('images', form.images.filter((_, itemIndex) => itemIndex !== index))} className="absolute right-2 top-2 rounded-full bg-white/95 p-1.5 text-red-700 shadow" aria-label={`Remove image ${index + 1}`}><X size={14}/></button></div>)}</div>
          {!form.images.length && <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 border border-dashed border-stone-300 bg-white text-sm text-stone-400"><ImagePlus size={24}/>No images added</div>}
          {jsonError && <p role="alert" className="text-xs text-red-700">{jsonError}</p>}
        </aside>
      </div>
      <div className="sticky bottom-0 flex justify-end gap-3 border-t border-stone-200 bg-[#fbfaf8] px-5 py-4 sm:px-7"><button type="button" onClick={onClose} className={`${buttonClass} border border-stone-300 bg-white text-stone-700`}>Cancel</button><button type="submit" disabled={saving || uploading} className={`${buttonClass} min-w-36 bg-stone-900 text-white hover:bg-stone-700`}>{saving ? <><LoaderCircle size={16} className="animate-spin"/> Saving</> : 'Save product'}</button></div>
    </form>
  </div>;
}

function OrdersPanel({ orders, onOpen, onStatus, busyOrder }: { orders: Order[]; onOpen: (order: Order) => void; onStatus: (order: Order, status: string) => void; busyOrder: string }) {
  const [query, setQuery] = useState('');
  const filtered = orders.filter(order => [order.order_number, order.customer?.name, order.customer?.email, order.status].some(value => value?.toLowerCase().includes(query.toLowerCase())));
  return <section className="space-y-4"><div><h2 className="font-display text-2xl">Orders</h2><p className="mt-1 text-sm text-stone-500">Review customer details, totals and fulfillment status.</p></div><div className="relative border border-stone-200 bg-white p-3"><Search size={16} className="absolute left-6 top-6 text-stone-400"/><input className={`${inputClass} mt-0 pl-9`} aria-label="Search orders" placeholder="Search order number or customer" value={query} onChange={event => setQuery(event.target.value)}/></div><div className="overflow-hidden border border-stone-200 bg-white">{filtered.length ? <OrderTable orders={filtered} onOpen={onOpen} onStatus={onStatus} busyOrder={busyOrder}/> : <EmptyState title={query ? 'No matching orders' : 'No orders yet'} message={query ? 'Try another order number or customer.' : 'New customer orders will appear here.'}/>}</div></section>;
}

function OrderTable({ orders, onOpen, onStatus, busyOrder, compact = false }: { orders: Order[]; onOpen: (order: Order) => void; onStatus: (order: Order, status: string) => void; busyOrder: string; compact?: boolean }) {
  if (!orders.length) return <EmptyState title="No orders yet" message="New customer orders will appear here."/>;
  return <><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[820px] text-left text-sm"><thead className="bg-stone-50 text-[11px] uppercase tracking-wide text-stone-500"><tr><th className="px-5 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th><th className="px-5 py-3 text-right">Details</th></tr></thead><tbody>{orders.map(order => <OrderRow key={order.order_number} order={order} onOpen={onOpen} onStatus={onStatus} busy={busyOrder === order.order_number}/>)}</tbody></table></div><div className="divide-y divide-stone-200 md:hidden">{orders.map(order => <OrderCard key={order.order_number} order={order} onOpen={onOpen} onStatus={onStatus} busy={busyOrder === order.order_number}/>)}</div></>;
}

function OrderRow({ order, onOpen, onStatus, busy }: { order: Order; onOpen: (order: Order) => void; onStatus: (order: Order, status: string) => void; busy: boolean }) {
  return <tr className="border-t border-stone-100"><td className="px-5 py-4"><button onClick={() => onOpen(order)} className="font-medium hover:underline">{order.order_number}</button><p className="mt-1 text-xs text-stone-500">{order.items?.length || 0} items</p></td><td className="px-4 py-4"><p>{order.customer?.name || '—'}</p><p className="mt-1 text-xs text-stone-500">{order.customer?.phone || order.customer?.email}</p></td><td className="whitespace-nowrap px-4 py-4 text-xs text-stone-500">{dateLabel(order.created_at)}</td><td className="px-4 py-4 font-medium">{money(order.total)}</td><td className="px-4 py-4"><StatusSelect order={order} onStatus={onStatus} busy={busy}/></td><td className="px-5 py-4 text-right"><button onClick={() => onOpen(order)} className="text-xs text-stone-700 underline">View details</button></td></tr>;
}

function OrderCard({ order, onOpen, onStatus, busy }: { order: Order; onOpen: (order: Order) => void; onStatus: (order: Order, status: string) => void; busy: boolean }) {
  return <article className="p-4"><div className="flex items-start justify-between gap-3"><div><button onClick={() => onOpen(order)} className="text-left font-medium hover:underline">{order.order_number}</button><p className="mt-1 text-xs text-stone-500">{dateLabel(order.created_at)} · {order.items?.length || 0} items</p></div><p className="font-medium">{money(order.total)}</p></div><div className="mt-3 flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm">{order.customer?.name || '—'}</p><p className="truncate text-xs text-stone-500">{order.customer?.phone || order.customer?.email}</p></div><StatusSelect order={order} onStatus={onStatus} busy={busy}/></div><button onClick={() => onOpen(order)} className="mt-3 text-xs text-stone-700 underline">View order details</button></article>;
}

function StatusSelect({ order, onStatus, busy }: { order: Order; onStatus: (order: Order, status: string) => void; busy: boolean }) {
  return <label className="relative inline-flex items-center"><span className="sr-only">Status for order {order.order_number}</span><select disabled={busy} value={order.status} onChange={event => onStatus(order, event.target.value)} className={`appearance-none rounded-full border py-1.5 pl-3 pr-8 text-xs font-medium capitalize outline-none focus:ring-2 focus:ring-stone-300 disabled:opacity-60 ${statusColor(order.status)}`}>{(orderTransitions[order.status] || [order.status]).map(status => <option key={status} value={status}>{status}</option>)}</select><ChevronDown size={13} className="pointer-events-none absolute right-2"/>{busy && <LoaderCircle size={13} className="absolute -right-5 animate-spin"/>}</label>;
}

function OrderDetails({ order, busy, onClose, onStatus, onRetryNotification }: { order: Order; busy: boolean; onClose: () => void; onStatus: (status: string) => void; onRetryNotification: () => void }) {
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 p-3 sm:p-6" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="order-details-title" className="mx-auto my-4 max-w-3xl border border-stone-200 bg-[#fbfaf8] shadow-xl sm:my-10">
    <header className="flex items-start justify-between border-b border-stone-200 px-5 py-4 sm:px-7"><div><p className="text-[10px] uppercase tracking-[.2em] text-stone-500">Order details</p><h2 id="order-details-title" className="mt-1 font-display text-2xl">{order.order_number}</h2><p className="mt-1 text-xs text-stone-500">Placed {dateLabel(order.created_at)}</p></div><button onClick={onClose} className="rounded p-2 text-stone-500 hover:bg-stone-200" aria-label="Close order details"><X size={20}/></button></header>
    <div className="grid gap-6 p-5 sm:p-7 md:grid-cols-2"><div className="space-y-5"><section><h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Customer</h3><p className="mt-2 font-medium">{order.customer?.name || '—'}</p><p className="mt-1 text-sm text-stone-600">{order.customer?.email || '—'}</p><p className="mt-1 text-sm text-stone-600">{order.customer?.phone || '—'}</p></section><section><h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Shipping address</h3><p className="mt-2 text-sm leading-6 text-stone-700">{order.shipping?.address}<br/>{order.shipping?.city} {order.shipping?.postal}<br/>{order.shipping?.country}</p></section><section><h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Fulfillment</h3><p className="mt-2 text-sm capitalize">{order.delivery_method || 'standard'} delivery</p><p className="mt-1 text-sm capitalize">Payment: {order.payment_method || '—'}</p></section></div>
      <div><h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Items ({order.items?.length || 0})</h3><div className="mt-2 divide-y divide-stone-200 border-y border-stone-200">{order.items?.map((item, index) => <div key={`${item.productId}-${index}`} className="flex gap-3 py-3 text-sm"><div className="relative h-16 w-12 shrink-0 overflow-hidden bg-stone-100">{item.image && <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" unoptimized/>}</div><div className="min-w-0 flex-1"><p className="font-medium">{item.name}</p><p className="mt-1 text-xs text-stone-500">SKU: {item.sku || '—'}</p><p className="mt-1 text-xs text-stone-600">Size: {item.size || '—'} · Color: {item.color || '—'} · Qty: {item.quantity}</p><p className="mt-1 text-xs text-stone-500">{money(item.unitPrice)} each</p></div><p className="whitespace-nowrap font-medium">{money(item.lineTotal)}</p></div>)}</div><dl className="mt-4 space-y-2 text-sm"><div className="flex justify-between"><dt className="text-stone-500">Subtotal</dt><dd>{money(order.subtotal)}</dd></div><div className="flex justify-between"><dt className="text-stone-500">Shipping</dt><dd>{money(order.shipping_total)}</dd></div>{order.tax > 0 && <div className="flex justify-between"><dt className="text-stone-500">Tax</dt><dd>{money(order.tax)}</dd></div>}<div className="flex justify-between border-t border-stone-200 pt-3 text-base font-semibold"><dt>Total</dt><dd>{money(order.total)}</dd></div></dl></div>
    </div>
    <footer className="flex flex-col gap-3 border-t border-stone-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7"><div className="flex flex-wrap items-center gap-3"><span className="text-xs uppercase tracking-wide text-stone-500">Update status</span><StatusSelect order={order} onStatus={(_, status) => onStatus(status)} busy={busy}/></div><div className="flex flex-wrap justify-end gap-2"><button onClick={onRetryNotification} disabled={busy} className={`${buttonClass} border border-stone-300 bg-white text-stone-700 hover:bg-stone-50`}><RefreshCw size={15}/>Retry email</button><button onClick={onClose} className={`${buttonClass} bg-stone-900 text-white hover:bg-stone-700`}>Done</button></div></footer>
  </section></div>;
}

function EmptyState({ title, message, action }: { title: string; message: string; action?: React.ReactNode }) {
  return <div className="flex flex-col items-center justify-center px-6 py-12 text-center"><span className="rounded-full bg-stone-100 p-3 text-stone-500"><Box size={20}/></span><h3 className="mt-4 font-display text-xl">{title}</h3><p className="mt-1 max-w-sm text-sm text-stone-500">{message}</p>{action && <div className="mt-5">{action}</div>}</div>;
}

function categoryName(slug: string) {
  return categories.find(category => category.slug === slug)?.name || slug;
}

function statusColor(status: string) {
  if (status === 'completed' || status === 'shipped') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (status === 'cancelled') return 'border-red-200 bg-red-50 text-red-800';
  if (status === 'processing') return 'border-blue-200 bg-blue-50 text-blue-800';
  return 'border-amber-200 bg-amber-50 text-amber-900';
}

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en-PK', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Karachi' }).format(date);
}
