import Image from "next/image";
import Link from "next/link";
import type { StoreProduct } from "@/lib/data";
import { discountPercent, formatRupiah } from "@/lib/utils";

export function ProductCard({ product, priority = false }: { product: StoreProduct; priority?: boolean }) {
  const [primary, secondary] = product.images;
  const discount = discountPercent(product.price, product.compareAtPrice);

  return (
    <Link href={`/produk/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
        {primary && (
          <Image
            src={primary.url}
            alt={primary.alt ?? product.name}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
        {secondary && (
          <Image
            src={secondary.url}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="hidden object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:block"
          />
        )}
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {discount > 0 && <span className="bg-fuji px-2 py-1 text-xs font-bold text-white">-{discount}%</span>}
          {!product.inStock && <span className="bg-ink px-2 py-1 text-xs font-semibold text-paper">Stok habis</span>}
        </div>
      </div>
      <div className="pt-3">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">{product.category.name}</p>
        <h3 className="mt-1 text-sm font-semibold leading-snug group-hover:text-fuji sm:text-base">{product.name}</h3>
        <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className="font-semibold">{formatRupiah(product.price)}</span>
          {discount > 0 && (
            <span className="text-muted line-through">{formatRupiah(product.compareAtPrice!)}</span>
          )}
        </p>
      </div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: StoreProduct[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} priority={index < 2} />
        </li>
      ))}
    </ul>
  );
}
