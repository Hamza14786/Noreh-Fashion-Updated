'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  Heart,
  User,
  MapPin,
  CreditCard,
  Truck,
  KeyRound,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Tab = 'overview' | 'orders' | 'wishlist' | 'profile' | 'addresses' | 'payment' | 'password';

const menuItems: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'payment', label: 'Payment Methods', icon: CreditCard },
  { id: 'password', label: 'Change Password', icon: KeyRound },
];

const mockOrders = [
  { id: 'ORD-2026-001', date: 'Aug 15, 2026', total: 245.00, status: 'Delivered', items: 3 },
  { id: 'ORD-2026-002', date: 'Aug 28, 2026', total: 132.00, status: 'Shipped', items: 2 },
  { id: 'ORD-2026-003', date: 'Aug 30, 2026', total: 89.00, status: 'Processing', items: 1 },
];

const statusColors: Record<string, string> = {
  Delivered: 'bg-success text-success-foreground',
  Shipped: 'bg-primary text-primary-foreground',
  Processing: 'bg-warning text-warning-foreground',
  Confirmed: 'bg-secondary text-secondary-foreground',
  Cancelled: 'bg-destructive text-destructive-foreground',
};

export default function AccountPage() {
  const { wishlist } = useStore();
  const [tab, setTab] = useState<Tab>('overview');

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span>My Account</span>
      </nav>

      <h1 className="font-display text-3xl md:text-4xl mb-8">My Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-secondary/50 rounded-sm p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-medium text-lg">
                J
              </div>
              <div>
                <p className="font-medium">Jane Doe</p>
                <p className="text-xs text-muted-foreground">jane@example.com</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={cn(
                  'flex items-center gap-3 w-full px-4 py-2.5 text-sm rounded-sm transition-colors text-left',
                  tab === item.id ? 'bg-foreground text-background' : 'hover:bg-secondary'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.id === 'wishlist' && wishlist.length > 0 && (
                  <span className="ml-auto text-xs bg-accent text-accent-foreground px-1.5 rounded-full">
                    {wishlist.length}
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={() => { toast.success('Logged out successfully'); setTimeout(() => window.location.href = '/', 500); }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm rounded-sm hover:bg-secondary transition-colors text-left text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">
          {tab === 'overview' && <OverviewTab setTab={setTab} />}
          {tab === 'orders' && <OrdersTab />}
          {tab === 'wishlist' && <WishlistTab />}
          {tab === 'profile' && <ProfileTab />}
          {tab === 'addresses' && <AddressesTab />}
          {tab === 'payment' && <PaymentTab />}
          {tab === 'password' && <PasswordTab />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ setTab }: { setTab: (t: Tab) => void }) {
  const { wishlist, cart } = useStore();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-secondary/50 rounded-sm p-5">
          <Package className="h-5 w-5 text-muted-foreground mb-2" />
          <p className="text-2xl font-display">{mockOrders.length}</p>
          <p className="text-xs text-muted-foreground">Total Orders</p>
        </div>
        <div className="bg-secondary/50 rounded-sm p-5">
          <Heart className="h-5 w-5 text-muted-foreground mb-2" />
          <p className="text-2xl font-display">{wishlist.length}</p>
          <p className="text-xs text-muted-foreground">Wishlist Items</p>
        </div>
        <div className="bg-secondary/50 rounded-sm p-5">
          <CreditCard className="h-5 w-5 text-muted-foreground mb-2" />
          <p className="text-2xl font-display">{cart.length}</p>
          <p className="text-xs text-muted-foreground">Cart Items</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">Recent Orders</h2>
          <button onClick={() => setTab('orders')} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            View All <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="space-y-3">
          {mockOrders.slice(0, 2).map((order) => (
            <div key={order.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium">{order.id}</p>
                <p className="text-xs text-muted-foreground">{order.date} · {order.items} items</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">${order.total.toFixed(2)}</span>
                <Badge className={statusColors[order.status]}>{order.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OrdersTab() {
  return (
    <div className="bg-card border border-border rounded-sm p-6">
      <h2 className="font-display text-xl mb-4">Order History</h2>
      {mockOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-medium mb-1">No orders yet</p>
          <p className="text-sm text-muted-foreground mb-4">Start shopping to see your orders here.</p>
          <Button asChild><Link href="/shop">Browse Products</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {mockOrders.map((order) => (
            <div key={order.id} className="border border-border rounded-sm p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">${order.total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{order.items} items</p>
                  </div>
                  <Badge className={statusColors[order.status]}>{order.status}</Badge>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WishlistTab() {
  const { wishlist, removeFromWishlist } = useStore();
  return (
    <div className="bg-card border border-border rounded-sm p-6">
      <h2 className="font-display text-xl mb-4">My Wishlist</h2>
      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-medium mb-1">Your wishlist is empty</p>
          <p className="text-sm text-muted-foreground mb-4">Save your favorite styles here.</p>
          <Button asChild><Link href="/shop">Explore Collection</Link></Button>
        </div>
      ) : (
        <div className="space-y-3">
          {wishlist.map((item) => (
            <div key={item.productId} className="flex items-center gap-4 border border-border rounded-sm p-3">
              <Link href={`/products/${item.slug}`} className="w-16 h-20 shrink-0 overflow-hidden bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1">
                <Link href={`/products/${item.slug}`} className="text-sm font-medium hover:text-accent-foreground">{item.name}</Link>
                <p className="text-sm text-muted-foreground">${item.salePrice ?? item.price}</p>
              </div>
              <Button asChild size="sm"><Link href={`/products/${item.slug}`}>View Product</Link></Button>
              <button onClick={() => removeFromWishlist(item.productId)} className="text-muted-foreground hover:text-destructive p-1">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileTab() {
  return (
    <div className="bg-card border border-border rounded-sm p-6">
      <h2 className="font-display text-xl mb-4">Profile Information</h2>
      <form onSubmit={(e) => { e.preventDefault(); toast.success('Profile updated successfully'); }} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pname">Full Name</Label>
            <Input id="pname" defaultValue="Jane Doe" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="pemail">Email</Label>
            <Input id="pemail" type="email" defaultValue="jane@example.com" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="pphone">Phone</Label>
            <Input id="pphone" type="tel" defaultValue="+1 234 567 890" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="pdob">Date of Birth</Label>
            <Input id="pdob" type="date" className="mt-1" />
          </div>
        </div>
        <Button type="submit">Save Changes</Button>
      </form>
    </div>
  );
}

function AddressesTab() {
  return (
    <div className="bg-card border border-border rounded-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl">Saved Addresses</h2>
        <Button variant="outline" size="sm" onClick={() => toast.success('Address form coming soon')}>Add New</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-border rounded-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge>Default</Badge>
            <button className="text-xs text-muted-foreground hover:text-foreground">Edit</button>
          </div>
          <p className="text-sm font-medium">Jane Doe</p>
          <p className="text-sm text-muted-foreground">123 Fashion Avenue</p>
          <p className="text-sm text-muted-foreground">New York, NY 10001</p>
          <p className="text-sm text-muted-foreground">United States</p>
          <p className="text-sm text-muted-foreground mt-1">+1 234 567 890</p>
        </div>
        <div className="border border-dashed border-border rounded-sm p-4 flex items-center justify-center min-h-[140px]">
          <button onClick={() => toast.success('Address form coming soon')} className="text-sm text-muted-foreground hover:text-foreground flex flex-col items-center gap-2">
            <MapPin className="h-5 w-5" />
            Add new address
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentTab() {
  return (
    <div className="bg-card border border-border rounded-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl">Payment Methods</h2>
      </div>
      <div className="border border-border rounded-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <div>
              
              <p className="text-sm font-medium">Cash on Delivery</p>
              <p className="text-xs text-muted-foreground">Currently the only payment method available at checkout.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PasswordTab() {
  return (
    <div className="bg-card border border-border rounded-sm p-6">
      <h2 className="font-display text-xl mb-4">Change Password</h2>
      <form onSubmit={(e) => { e.preventDefault(); toast.success('Password changed successfully'); }} className="space-y-4 max-w-md">
        <div>
          <Label htmlFor="curpass">Current Password</Label>
          <Input id="curpass" type="password" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="newpass">New Password</Label>
          <Input id="newpass" type="password" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="confpass">Confirm New Password</Label>
          <Input id="confpass" type="password" required className="mt-1" />
        </div>
        <Button type="submit">Update Password</Button>
      </form>
    </div>
  );
}
