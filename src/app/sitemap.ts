import type { MetadataRoute } from "next";
import { getCategories, getProductSlugs, getPublishedPages } from "@/lib/data";
import { siteUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [products, categories, pages] = await Promise.all([getProductSlugs(), getCategories(), getPublishedPages()]);

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/produk`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/tentang`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/kontak`, changeFrequency: "monthly", priority: 0.5 },
    ...categories.map((category) => ({
      url: `${base}/produk?kategori=${category.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: `${base}/produk/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...pages.map((page) => ({
      url: `${base}/info/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
