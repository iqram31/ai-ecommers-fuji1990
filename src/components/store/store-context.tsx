"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

export type CartItem = {
  key: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
};

type StoreInfo = { storeName: string; whatsappNumber: string };

type StoreContextValue = StoreInfo & {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "key">) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "fuji-cart-v1";
const MAX_QUANTITY = 99;
const EMPTY: CartItem[] = [];

// Keranjang disimpan di localStorage dan dibaca lewat useSyncExternalStore
// supaya aman saat hidrasi dan sinkron antar-tab.
const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedItems: CartItem[] = EMPTY;

function readItems(): CartItem[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return cachedItems;
  }
  if (raw === cachedRaw) return cachedItems;
  cachedRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    cachedItems = Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    cachedItems = EMPTY;
  }
  return cachedItems;
}

function writeItems(items: CartItem[]) {
  cachedItems = items;
  cachedRaw = JSON.stringify(items);
  try {
    window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  } catch {
    // Penyimpanan tidak tersedia (mode privat): keranjang tetap hidup di memori.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children, ...info }: StoreInfo & { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, readItems, () => EMPTY);

  const addItem = useCallback((item: Omit<CartItem, "key">) => {
    const key = [item.slug, item.size ?? "", item.color ?? ""].join("|");
    const current = readItems();
    const existing = current.find((entry) => entry.key === key);
    writeItems(
      existing
        ? current.map((entry) =>
            entry.key === key
              ? { ...entry, ...item, key, quantity: Math.min(MAX_QUANTITY, entry.quantity + item.quantity) }
              : entry,
          )
        : [...current, { ...item, key }],
    );
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    const next = Math.max(1, Math.min(MAX_QUANTITY, Math.round(quantity) || 1));
    writeItems(readItems().map((entry) => (entry.key === key ? { ...entry, quantity: next } : entry)));
  }, []);

  const removeItem = useCallback((key: string) => {
    writeItems(readItems().filter((entry) => entry.key !== key));
  }, []);

  const clear = useCallback(() => writeItems([]), []);

  const value = useMemo<StoreContextValue>(
    () => ({
      ...info,
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      addItem,
      setQuantity,
      removeItem,
      clear,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [info.storeName, info.whatsappNumber, items, addItem, setQuantity, removeItem, clear],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore harus dipakai di dalam StoreProvider");
  return value;
}
