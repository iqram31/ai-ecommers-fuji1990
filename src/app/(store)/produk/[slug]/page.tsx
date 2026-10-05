import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ExternalLink } from "lucide-react";
import { ProductGrid } from "@/components/store/product-card";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductPurchase } from "@/components/store/product-purchase";
import { RichText } from "@/components/store/rich-text";
import { getProductBySlug, getProductSlugs, getRelatedProducts, getSettings } from "@/lib/data";
import { discountPercent, formatRupiah, siteUrl } from "@/lib/utils";

export async function generateStaticParams() {
  const products = await getProductSlugs();
  return products.map(({ slug }) => ({ slug }));
}

function summary(description: string) {
  const firstLine = description.split(/\r?\n/).find((line) => line.trim() && !line.startsWith("#")) ?? "";
  return firstLine.replace(/\*\*/g, "").slice(0, 160);
}

export async function generateMetadata({ params }: PageProps<"/produk/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const description = summary(product.description);
  return {
    title: product.name,
    description,
    alternates: { canonical: `/produk/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      images: product.images.slice(0, 1).map((image) => ({ url: image.url, alt: image.alt ?? product.name })),
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/produk/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [settings, related] = await Promise.all([getSettings(), getRelatedProducts(product)]);
  const productUrl = `${siteUrl()}/produk/${product.slug}`;
  const discount = discountPercent(product.price, product.compareAtPrice);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: summary(product.description),
    image: product.images.map((image) => new URL(image.url, siteUrl()).toString()),
    category: product.category.name,
    brand: { "@type": "Brand", name: settings.storeName },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "IDR",
      price: product.price,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="container-page py-6 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-fuji">
              Beranda
            </Link>
          </li>
          <li aria-hidden><ChevronRight className="size-3.5" /></li>
          <li>
            <Link href={`/produk?kategori=${product.category.slug}`} className="hover:text-fuji">
              {product.category.name}
            </Link>
          </li>
          <li aria-hidden><ChevronRight className="size-3.5" /></li>
          <li aria-current="page" className="text-ink">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
        <ProductGallery name={product.name} images={product.images} videoUrl={product.videoUrl} />

        <div className="min-w-0">
          <p className="eyebrow">{product.category.name}</p>
          <h1 className="mt-2 font-display text-4xl leading-none tracking-wide sm:text-5xl">{product.name}</h1>

          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-2xl font-bold">{formatRupiah(product.price)}</span>
            {discount > 0 && (
              <>
                <span className="text-muted line-through">{formatRupiah(product.compareAtPrice!)}</span>
                <span className="bg-fuji px-2 py-0.5 text-xs font-bold text-white">Hemat {discount}%</span>
              </>
            )}
          </p>
          {product.material && <p className="mt-2 text-sm text-muted">Material: {product.material}</p>}

          <div className="mt-7 border-t border-line pt-7">
            <ProductPurchase
              productUrl={productUrl}
              product={{
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.images[0]?.url ?? null,
                sizes: product.sizes,
                colors: product.colors,
                inStock: product.inStock,
              }}
            />
            <p className="mt-4 text-sm text-muted">
              Bingung pilih ukuran? Lihat{" "}
              <Link href="/info/panduan-ukuran" className="underline underline-offset-4 hover:text-fuji">
                panduan ukuran
              </Link>{" "}
              atau tanya admin.
            </p>
            {product.marketplaceUrl && (
              <a
                href={product.marketplaceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4 hover:text-fuji"
              >
                Juga tersedia di marketplace <ExternalLink aria-hidden className="size-3.5" />
              </a>
            )}
          </div>

          <section aria-label="Deskripsi produk" className="mt-8 border-t border-line pt-7">
            <RichText content={product.description} />
          </section>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-line pt-12 sm:mt-24">
          <h2 className="heading">Produk lainnya</h2>
          <div className="mt-8">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  );
}
