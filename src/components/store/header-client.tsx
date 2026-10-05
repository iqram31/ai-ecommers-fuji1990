"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import type { NavLink } from "./header";
import { useStore } from "./store-context";

export function CartLink() {
  const { count } = useStore();
  return (
    <Link
      href="/keranjang"
      aria-label={count > 0 ? `Keranjang, ${count} barang` : "Keranjang"}
      className="relative flex size-11 items-center justify-center hover:text-fuji"
    >
      <ShoppingBag aria-hidden className="size-5" />
      {count > 0 && (
        <span className="absolute right-0.5 top-1 flex min-w-5 items-center justify-center rounded-full bg-fuji px-1 text-[11px] font-bold leading-5 text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

export function MobileMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Tutup menu" : "Buka menu"}
        onClick={() => setOpen((value) => !value)}
        className="-ml-2 flex size-11 items-center justify-center"
      >
        {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
      </button>

      {open && (
        <div id="mobile-menu" className="absolute inset-x-0 top-16 border-b border-line bg-paper shadow-lg">
          <div className="container-page py-4">
            <form action="/produk" role="search" className="relative md:hidden" onSubmit={close}>
              <label htmlFor="mobile-search" className="sr-only">
                Cari produk
              </label>
              <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input id="mobile-search" name="q" type="search" placeholder="Cari produk" className="input pl-9" />
            </form>
            <nav aria-label="Navigasi utama" className="mt-2 flex flex-col">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className="border-b border-line/70 py-3.5 font-display text-2xl tracking-wide last:border-0"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
