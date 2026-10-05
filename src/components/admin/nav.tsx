"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, GalleryHorizontal, LayoutDashboard, Settings, Shirt, Tags } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/admin/produk", label: "Produk", icon: Shirt },
  { href: "/admin/kategori", label: "Kategori", icon: Tags },
  { href: "/admin/banner", label: "Banner", icon: GalleryHorizontal },
  { href: "/admin/halaman", label: "Halaman", icon: FileText },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Menu admin" className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-0">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 shrink-0 items-center gap-3 px-3 text-sm font-medium",
              active ? "bg-paper text-ink" : "text-paper/70 hover:bg-paper/10 hover:text-paper",
            )}
          >
            <Icon aria-hidden className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
