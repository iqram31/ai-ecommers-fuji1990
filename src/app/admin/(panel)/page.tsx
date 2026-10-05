import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { getSettings } from "@/lib/data";
import { hasDatabase, prisma } from "@/lib/prisma";
import { displayWhatsapp } from "@/lib/whatsapp";

async function getCounts() {
  if (!hasDatabase) return { products: 0, drafts: 0, outOfStock: 0, categories: 0, banners: 0, pages: 0 };
  const [products, drafts, outOfStock, categories, banners, pages] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isPublished: false } }),
    prisma.product.count({ where: { inStock: false } }),
    prisma.category.count(),
    prisma.banner.count({ where: { isActive: true } }),
    prisma.page.count(),
  ]);
  return { products, drafts, outOfStock, categories, banners, pages };
}

export default async function AdminDashboard() {
  const [counts, settings] = await Promise.all([getCounts(), getSettings()]);

  const cards = [
    { href: "/admin/produk", label: "Produk", value: counts.products, note: `${counts.drafts} draf · ${counts.outOfStock} stok habis` },
    { href: "/admin/kategori", label: "Kategori", value: counts.categories, note: "Jaket, celana, baju, dan lainnya" },
    { href: "/admin/banner", label: "Banner aktif", value: counts.banners, note: "Tampil di beranda" },
    { href: "/admin/halaman", label: "Halaman", value: counts.pages, note: "Cara order, panduan ukuran, dan lainnya" },
  ];

  return (
    <>
      <PageHeader title="Ringkasan" description={`Kelola produk dan konten ${settings.storeName}.`} />

      <ul className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <li key={card.href}>
            <Link href={card.href} className="group block border border-line bg-white p-5 hover:border-ink">
              <p className="text-sm font-semibold text-muted">{card.label}</p>
              <p className="mt-1 font-display text-5xl tabular-nums">{card.value}</p>
              <p className="mt-1 flex items-center justify-between text-xs text-muted">
                {card.note}
                <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border border-line bg-white p-5">
        <div>
          <p className="text-sm font-semibold text-muted">Nomor WhatsApp order</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{displayWhatsapp(settings.whatsappNumber)}</p>
        </div>
        <Link href="/admin/pengaturan" className="btn btn-outline">
          Ubah pengaturan
        </Link>
      </div>
    </>
  );
}
