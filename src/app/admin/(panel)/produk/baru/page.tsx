import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/forms";
import { PageHeader } from "@/components/admin/ui";
import { hasDatabase, prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Tambah Produk" };

export default async function NewProductPage() {
  const categories = hasDatabase
    ? await prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } })
    : [];

  return (
    <>
      <PageHeader title="Tambah produk" backHref="/admin/produk" />
      <ProductForm
        categories={categories}
        product={{
          name: "",
          slug: "",
          categoryId: "",
          description: "",
          price: null,
          compareAtPrice: null,
          sizes: [],
          colors: [],
          material: null,
          inStock: true,
          isFeatured: false,
          isPublished: true,
          videoUrl: null,
          marketplaceUrl: null,
          images: [],
        }}
      />
    </>
  );
}
