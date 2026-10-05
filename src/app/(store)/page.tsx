import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, MessageCircle, Scissors } from "lucide-react";
import { WhatsAppIcon } from "@/components/store/brand";
import { HeroCarousel } from "@/components/store/hero-carousel";
import { ProductGrid } from "@/components/store/product-card";
import { getActiveBanners, getCategories, getFeaturedProducts, getLatestProducts, getSettings } from "@/lib/data";
import { whatsappLink } from "@/lib/whatsapp";

export default async function HomePage() {
  const [settings, banners, categories, featured, latest] = await Promise.all([
    getSettings(),
    getActiveBanners(),
    getCategories(),
    getFeaturedProducts(4),
    getLatestProducts(8),
  ]);
  const highlighted = featured.length > 0 ? featured : latest.slice(0, 4);
  const featuredIds = new Set(highlighted.map((product) => product.id));
  const newest = latest.filter((product) => !featuredIds.has(product.id));

  return (
    <>
      <h1 className="sr-only">{settings.storeName} — clothing dari Bandung</h1>
      <HeroCarousel banners={banners} />

      <section aria-label="Keunggulan" className="border-b border-line bg-sand">
        <ul className="container-page grid gap-4 py-5 text-sm sm:grid-cols-3">
          <li className="flex items-center gap-3">
            <MapPin aria-hidden className="size-5 shrink-0 text-fuji" />
            Dikirim dari Bandung ke seluruh Indonesia
          </li>
          <li className="flex items-center gap-3">
            <Scissors aria-hidden className="size-5 shrink-0 text-fuji" />
            Jaket, celana, dan baju original FUJI
          </li>
          <li className="flex items-center gap-3">
            <MessageCircle aria-hidden className="size-5 shrink-0 text-fuji" />
            Order dan konsultasi ukuran via WhatsApp
          </li>
        </ul>
      </section>

      {categories.length > 0 && (
        <section className="container-page py-14 sm:py-20">
          <p className="eyebrow">Koleksi</p>
          <h2 className="heading mt-2">Belanja per kategori</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/produk?kategori=${category.slug}`}
                  className="group relative block aspect-[4/5] overflow-hidden bg-ink sm:aspect-[3/4]"
                >
                  {category.imageUrl && (
                    <Image
                      src={category.imageUrl}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 33vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <span className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 p-5 text-paper">
                    <span className="block font-display text-4xl tracking-wide">{category.name}</span>
                    {category.description && (
                      <span className="mt-1 block text-sm text-paper/80">{category.description}</span>
                    )}
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">
                      Lihat koleksi
                      <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {highlighted.length > 0 && (
        <section className="border-y border-line bg-white/60">
          <div className="container-page py-14 sm:py-20">
            <SectionHeader eyebrow="Pilihan kami" title="Produk unggulan" />
            <div className="mt-8">
              <ProductGrid products={highlighted} />
            </div>
          </div>
        </section>
      )}

      {newest.length > 0 && (
        <section className="container-page py-14 sm:py-20">
          <SectionHeader eyebrow="Baru masuk" title="Rilisan terbaru" />
          <div className="mt-8">
            <ProductGrid products={newest} />
          </div>
        </section>
      )}

      <section className="bg-ink text-paper">
        <div className="container-page grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <p className="font-serif text-xl italic text-paper/70">Tentang kami</p>
            <h2 className="heading mt-2 text-5xl sm:text-6xl">{settings.aboutTitle}</h2>
            <p className="mt-5 max-w-xl leading-relaxed text-paper/70">{settings.aboutBody.split(/\n+/)[0]}</p>
            <Link href="/tentang" className="btn mt-7 border border-paper text-paper hover:bg-paper hover:text-ink">
              Cerita kami <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
          <div className="border border-paper/15 p-8 sm:p-10">
            <h3 className="font-display text-3xl tracking-wide">Order langsung via WhatsApp</h3>
            <ol className="mt-5 space-y-3 text-sm text-paper/80">
              {["Pilih produk, ukuran, dan jumlah.", "Kirim pesanan ke admin lewat WhatsApp.", "Admin konfirmasi stok, ongkir, dan pembayaran."].map(
                (step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-fuji text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ),
              )}
            </ol>
            <a
              href={whatsappLink(settings.whatsappNumber, `Halo ${settings.storeName}, saya mau order.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp mt-7"
            >
              <WhatsAppIcon /> Chat admin
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="heading mt-2">{title}</h2>
      </div>
      <Link href="/produk" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold hover:text-fuji">
        Lihat semua <ArrowRight aria-hidden className="size-4" />
      </Link>
    </div>
  );
}
