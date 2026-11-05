'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import type { CartItem, WishlistItem, Product } from './types';
import { productMap } from './products';

interface StoreContextValue {
  cart: CartItem[];
  wishlist: WishlistItem[];
  isCartOpen: boolean;
  isSearchOpen: boolean;
  cartCount: number;
  cartSubtotal: number;
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateCartQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  moveWishlistToCart: (item: WishlistItem) => void;
  openSearch: () => void;
  closeSearch: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('me-cart');
      const savedWishlist = localStorage.getItem('me-wishlist');
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('me-cart', JSON.stringify(cart));
    }
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('me-wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, hydrated]);

  // Lock body scroll when cart or search is open
  useEffect(() => {
    if (isCartOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen, isSearchOpen]);

  const addToCart = useCallback(
    (product: Product, size: string, color: string, quantity = 1) => {
      setCart((prev) => {
        const existing = prev.find(
          (item) =>
            item.productId === product.id &&
            item.size === size &&
            item.color === color
        );
        if (existing) {
          return prev.map((item) =>
            item === existing
              ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
              : item
          );
        }
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            salePrice: product.salePrice,
            image: product.images[0],
            size,
            color,
            quantity,
            stock: product.stock,
          },
        ];
      });
    },
    []
  );

  const removeFromCart = useCallback(
    (productId: string, size: string, color: string) => {
      setCart((prev) =>
        prev.filter(
          (item) =>
            !(item.productId === productId && item.size === size && item.color === color)
        )
      );
    },
    []
  );

  const updateCartQuantity = useCallback(
    (productId: string, size: string, color: string, quantity: number) => {
      if (quantity < 1) return;
      setCart((prev) =>
        prev.map((item) =>
          item.productId === productId && item.size === size && item.color === color
            ? { ...item, quantity: Math.min(quantity, item.stock) }
            : item
        )
      );
    },
    []
  );

  const clearCart = useCallback(() => setCart([]), []);

  const addToWishlist = useCallback((product: Product) => {
    setWishlist((prev) => {
      if (prev.some((item) => item.productId === product.id)) return prev;
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          salePrice: product.salePrice,
          image: product.images[0],
          addedAt: new Date().toISOString(),
        },
      ];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => wishlist.some((item) => item.productId === productId),
    [wishlist]
  );

  const moveWishlistToCart = useCallback((item: WishlistItem) => {
    const product = productMap[item.slug];
    const defaultSize = product?.sizes[0] || 'M';
    const defaultColor = product?.colors[0]?.name || '';
    const availableStock = product?.stock ?? 99;
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.productId === item.productId && i.size === defaultSize && i.color === defaultColor
      );
      if (existing) {
        return prev.map((i) =>
          i === existing ? { ...i, quantity: Math.min(i.quantity + 1, availableStock) } : i
        );
      }
      return [
        ...prev,
        {
          productId: item.productId,
          name: item.name,
          slug: item.slug,
          price: item.price,
          salePrice: item.salePrice,
          image: item.image,
          size: defaultSize,
          color: defaultColor,
          quantity: 1,
          stock: availableStock,
        },
      ];
    });
    setWishlist((prev) => prev.filter((i) => i.productId !== item.productId));
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((v) => !v), []);
  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => {
    const price = item.salePrice ?? item.price;
    return sum + price * item.quantity;
  }, 0);

  const value: StoreContextValue = {
    cart,
    wishlist,
    isCartOpen,
    isSearchOpen,
    cartCount,
    cartSubtotal,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    moveWishlistToCart,
    openSearch,
    closeSearch,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
