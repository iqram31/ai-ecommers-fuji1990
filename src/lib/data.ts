import "server-only";
import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { hasDatabase, prisma } from "./prisma";
import { seedBanners, seedCategories, seedPages, seedProducts, seedSettings } from "./seed-data";

export const PRODUCTS_PER_PAGE = 12;

export type StoreSettings = {
  storeName: string;
  tagline: string;
  description: string;
  whatsappNumber: string;
  email: string | null;
  address: string | null;
  openHours: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  shopeeUrl: string | null;
  announcement: string | null;
  aboutTitle: string;
  aboutBody: string;
};

export type StoreCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
};

export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  sizes: string[];
  colors: string[];
  material: string | null;
  inStock: boolean;
  isFeatured: boolean;
  videoUrl: string | null;
  marketplaceUrl: string | null;
  category: { name: string; slug: string };
  images: { url: string; alt: string | null }[];
  createdAt: Date;
  updatedAt: Date;
};

export type StoreBanner = { id: string; title: string; imageUrl: string; linkUrl: string | null };
export type StorePage = { title: string; slug: string; content: string; updatedAt: Date };

export const SORT_OPTIONS = {
  terbaru: "Terbaru",
  "harga-terendah": "Harga terendah",
  "harga-tertinggi": "Harga tertinggi",
  nama: "Nama A–Z",
} as const;
export type SortKey = keyof typeof SORT_OPTIONS;

const productInclude = {
  category: { select: { name: true, slug: true } },
  images: { select: { url: true, alt: true }, orderBy: { sortOrder: "asc" } },
} satisfies Prisma.ProductInclude;

// ---- Katalog contoh (dipakai hanya bila DATABASE_URL belum diatur) ----------

const demoDate = new Date("2025-01-01T00:00:00Z");
const demoProducts: StoreProduct[] = seedProducts.map((p, index) => {
  const category = seedCategories.find((c) => c.slug === p.categorySlug)!;
  return {
    id: p.slug,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    sizes: p.sizes,
    colors: p.colors,
    material: p.material,
    inStock: true,
    isFeatured: p.isFeatured,
    videoUrl: p.videoUrl,
    marketplaceUrl: p.marketplaceUrl,
    category: { name: category.name, slug: category.slug },
    images: p.images,
    createdAt: new Date(demoDate.getTime() - index * 86_400_000),
    updatedAt: demoDate,
  };
});

// ---- Pengaturan & konten -----------------------------------------------------

export const getSettings = cache(async (): Promise<StoreSettings> => {
  if (!hasDatabase) return seedSettings;
  const row = await prisma.siteSetting.findUnique({ where: { id: 1 } });
  return row ?? seedSettings;
});

export const getCategories = cache(async (): Promise<StoreCategory[]> => {
  if (!hasDatabase) return seedCategories.map((c) => ({ id: c.slug, ...c }));
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, description: true, imageUrl: true },
  });
});

export async function getActiveBanners(): Promise<StoreBanner[]> {
  if (!hasDatabase) return seedBanners.map((b) => ({ id: b.imageUrl, ...b }));
  return prisma.banner.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: { id: true, title: true, imageUrl: true, linkUrl: true },
  });
}

export const getFooterPages = cache(async (): Promise<{ title: string; slug: string }[]> => {
  if (!hasDatabase) return seedPages.map(({ title, slug }) => ({ title, slug }));
  return prisma.page.findMany({
    where: { isPublished: true, showInFooter: true },
    orderBy: { createdAt: "asc" },
    select: { title: true, slug: true },
  });
});

export async function getPublishedPages(): Promise<StorePage[]> {
  if (!hasDatabase) return seedPages.map((p) => ({ ...p, updatedAt: demoDate }));
  return prisma.page.findMany({
    where: { isPublished: true },
    select: { title: true, slug: true, content: true, updatedAt: true },
  });
}

export const getPageBySlug = cache(async (slug: string): Promise<StorePage | null> => {
  if (!hasDatabase) {
    const page = seedPages.find((p) => p.slug === slug);
    return page ? { ...page, updatedAt: demoDate } : null;
  }
  return prisma.page.findFirst({
    where: { slug, isPublished: true },
    select: { title: true, slug: true, content: true, updatedAt: true },
  });
});

// ---- Produk ------------------------------------------------------------------

export type ProductQuery = { category?: string; q?: string; sort?: SortKey; page?: number };

export async function getProducts({ category, q, sort = "terbaru", page = 1 }: ProductQuery = {}) {
  const search = q?.trim().slice(0, 80);
  const skip = (Math.max(1, page) - 1) * PRODUCTS_PER_PAGE;

  if (!hasDatabase) {
    const needle = search?.toLowerCase();
    const items = demoProducts
      .filter((p) => !category || p.category.slug === category)
      .filter((p) => !needle || `${p.name} ${p.description}`.toLowerCase().includes(needle))
      .sort((a, b) => {
        if (sort === "harga-terendah") return a.price - b.price;
        if (sort === "harga-tertinggi") return b.price - a.price;
        if (sort === "nama") return a.name.localeCompare(b.name);
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
    return { items: items.slice(skip, skip + PRODUCTS_PER_PAGE), total: items.length };
  }

  const where: Prisma.ProductWhereInput = {
    isPublished: true,
    ...(category ? { category: { slug: category } } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "harga-terendah"
      ? { price: "asc" }
      : sort === "harga-tertinggi"
        ? { price: "desc" }
        : sort === "nama"
          ? { name: "asc" }
          : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip, take: PRODUCTS_PER_PAGE, include: productInclude }),
    prisma.product.count({ where }),
  ]);
  return { items: items as StoreProduct[], total };
}

export async function getFeaturedProducts(take = 4): Promise<StoreProduct[]> {
  if (!hasDatabase) return demoProducts.filter((p) => p.isFeatured).slice(0, take);
  return prisma.product.findMany({
    where: { isPublished: true, isFeatured: true },
    orderBy: { updatedAt: "desc" },
    take,
    include: productInclude,
  });
}

export async function getLatestProducts(take = 8): Promise<StoreProduct[]> {
  if (!hasDatabase) return demoProducts.slice(0, take);
  return prisma.product.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take,
    include: productInclude,
  });
}

export const getProductBySlug = cache(async (slug: string): Promise<StoreProduct | null> => {
  if (!hasDatabase) return demoProducts.find((p) => p.slug === slug) ?? null;
  return prisma.product.findFirst({ where: { slug, isPublished: true }, include: productInclude });
});

export async function getRelatedProducts(product: StoreProduct, take = 4): Promise<StoreProduct[]> {
  if (!hasDatabase) return demoProducts.filter((p) => p.slug !== product.slug).slice(0, take);
  const sameCategory = await prisma.product.findMany({
    where: { isPublished: true, id: { not: product.id }, category: { slug: product.category.slug } },
    orderBy: { createdAt: "desc" },
    take,
    include: productInclude,
  });
  if (sameCategory.length >= take) return sameCategory;
  const others = await prisma.product.findMany({
    where: { isPublished: true, id: { notIn: [product.id, ...sameCategory.map((p) => p.id)] } },
    orderBy: { createdAt: "desc" },
    take: take - sameCategory.length,
    include: productInclude,
  });
  return [...sameCategory, ...others];
}

export async function getProductSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  if (!hasDatabase) return demoProducts.map(({ slug, updatedAt }) => ({ slug, updatedAt }));
  return prisma.product.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } });
}
