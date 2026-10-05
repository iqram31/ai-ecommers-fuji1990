import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { ProductGrid } from "@/components/store/product-card";
import { SortSelect } from "@/components/store/sort-select";
import { getCategories, getProducts, PRODUCTS_PER_PAGE, SORT_OPTIONS, type SortKey } from "@/lib/data";
import { cn } from "@/lib/utils";

type Filters = { kategori?: string; q?: string; urut?: SortKey; halaman?: number };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

function buildHref(filters: Filters) {
  const params = new URLSearchParams();
  if (filters.kategori) params.set("kategori", filters.kategori);
  if (filters.q) params.set("q", filters.q);
  if (filters.urut && filters.urut !== "terbaru") params.set("urut", filters.urut);
  if (filters.halaman && filters.halaman > 1) params.set("halaman", String(filters.halaman));
  const query = params.toString();
  return query ? `/produk?${query}` : "/produk";
}

async function readFilters(searchParams: PageProps<"/produk">["searchParams"]): Promise<Filters> {
  const params = await searchParams;
  const sort = first(params.urut);
  const page = Number.parseInt(first(params.halaman) ?? "1", 10);
  return {
    kategori: first(params.kategori) || undefined,
    q: first(params.q)?.trim().slice(0, 80) || undefined,
    urut: sort && sort in SORT_OPTIONS ? (sort as SortKey) : "terbaru",
    halaman: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export async function generateMetadata({ searchParams }: PageProps<"/produk">): Promise<Metadata> {
  const filters = await readFilters(searchParams);
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === filters.kategori);
  return {
    title: category ? category.name : "Semua Produk",
    description: category?.description ?? "Jaket, celana, dan baju dari FUJI — order langsung via WhatsApp.",
    alternates: { canonical: buildHref({ kategori: category?.slug }) },
    robots: filters.q ? { index: false } : undefined,
  };
}

export default async function ProductsPage({ searchParams }: PageProps<"/produk">) {
  const filters = await readFilters(searchParams);
  const [categories, { items, total }] = await Promise.all([
    getCategories(),
    getProducts({ category: filters.kategori, q: filters.q, sort: filters.urut, page: filters.halaman }),
  ]);
  const category = categories.find((item) => item.slug === filters.kategori);
  const pageCount = Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE));
  const page = filters.halaman ?? 1;

  return (
    <div className="container-page py-10 sm:py-14">
      <p className="eyebrow">Katalog</p>
      <h1 className="heading mt-2">{category?.name ?? "Semua Produk"}</h1>
      {category?.description && <p className="mt-2 max-w-2xl text-muted">{category.description}</p>}

      <div className="mt-8 flex flex-col gap-4 border-y border-line py-4 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filter kategori" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          <FilterChip href={buildHref({ q: filters.q, urut: filters.urut })} active={!filters.kategori}>
            Semua
          </FilterChip>
          {categories.map((item) => (
            <FilterChip
              key={item.slug}
              href={buildHref({ kategori: item.slug, q: filters.q, urut: filters.urut })}
              active={item.slug === filters.kategori}
            >
              {item.name}
            </FilterChip>
          ))}
        </nav>

        <div className="flex flex-col gap-3 sm:flex-row">
          <form action="/produk" role="search" className="relative sm:w-64">
            {filters.kategori && <input type="hidden" name="kategori" value={filters.kategori} />}
            {filters.urut && filters.urut !== "terbaru" && <input type="hidden" name="urut" value={filters.urut} />}
            <label htmlFor="catalog-search" className="sr-only">
              Cari produk
            </label>
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              id="catalog-search"
              name="q"
              type="search"
              defaultValue={filters.q}
              placeholder="Cari produk"
              className="input pl-9"
            />
          </form>
          <SortSelect value={filters.urut ?? "terbaru"} options={SORT_OPTIONS} />
        </div>
      </div>

      <p className="mt-5 text-sm text-muted" role="status">
        {total} produk
        {filters.q && (
          <>
            {" "}
            untuk “{filters.q}” ·{" "}
            <Link href={buildHref({ kategori: filters.kategori, urut: filters.urut })} className="underline underline-offset-4 hover:text-fuji">
              hapus pencarian
            </Link>
          </>
        )}
      </p>

      {items.length > 0 ? (
        <div className="mt-6">
          <ProductGrid products={items} />
        </div>
      ) : (
        <div className="mt-6 border border-dashed border-line px-6 py-16 text-center">
          <p className="font-display text-3xl tracking-wide">Produk tidak ditemukan</p>
          <p className="mt-2 text-sm text-muted">Coba kata kunci lain atau lihat semua koleksi.</p>
          <Link href="/produk" className="btn btn-primary mt-6">
            Lihat semua produk
          </Link>
        </div>
      )}

      {pageCount > 1 && (
        <nav aria-label="Halaman" className="mt-12 flex items-center justify-center gap-2">
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
            <Link
              key={number}
              href={buildHref({ ...filters, halaman: number })}
              aria-current={number === page ? "page" : undefined}
              className={cn(
                "flex size-11 items-center justify-center border text-sm font-semibold",
                number === page ? "border-ink bg-ink text-paper" : "border-line bg-white hover:border-ink",
              )}
            >
              {number}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-11 shrink-0 items-center border px-4 text-sm font-medium transition-colors",
        active ? "border-ink bg-ink text-paper" : "border-line bg-white hover:border-ink",
      )}
    >
      {children}
    </Link>
  );
}
