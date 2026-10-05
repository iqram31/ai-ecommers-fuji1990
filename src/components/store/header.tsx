import Link from "next/link";
import { Search } from "lucide-react";
import type { StoreCategory } from "@/lib/data";
import { Logo } from "./brand";
import { CartLink, MobileMenu } from "./header-client";

export type NavLink = { href: string; label: string };

export function Header({ storeName, categories }: { storeName: string; categories: StoreCategory[] }) {
  const links: NavLink[] = [
    { href: "/produk", label: "Semua Produk" },
    ...categories.map((category) => ({ href: `/produk?kategori=${category.slug}`, label: category.name })),
    { href: "/tentang", label: "Tentang" },
    { href: "/kontak", label: "Kontak" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4">
        <MobileMenu links={links} />

        <Link href="/" aria-label={`${storeName} — beranda`} className="shrink-0">
          <Logo name={storeName} />
        </Link>

        <nav aria-label="Navigasi utama" className="ml-6 hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink/80 underline-offset-8 hover:text-fuji hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <form action="/produk" role="search" className="relative hidden md:block">
            <label htmlFor="header-search" className="sr-only">
              Cari produk
            </label>
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              id="header-search"
              name="q"
              type="search"
              placeholder="Cari produk"
              className="h-10 w-44 border border-line bg-white pl-9 pr-3 text-sm placeholder:text-muted/70 focus:w-56 focus:border-ink focus:outline-none xl:w-56"
            />
          </form>
          <CartLink />
        </div>
      </div>
    </header>
  );
}
