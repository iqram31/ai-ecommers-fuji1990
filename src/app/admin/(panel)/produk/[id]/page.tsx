import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/forms";
import { PageHeader } from "@/components/admin/ui";
import { hasDatabase, prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Edit Produk" };

export default async function EditProductPage({ params }: PageProps<"/admin/produk/[id]">) {
  const { id } = await params;
  if (!hasDatabase) notFound();

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { select: { url: true, alt: true }, orderBy: { sortOrder: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!product) notFound();

  return (
    <>
      <PageHeader title="Edit produk" description={product.name} backHref="/admin/produk" />
      <ProductForm
        categories={categories}
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          categoryId: product.categoryId,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          sizes: product.sizes,
          colors: product.colors,
          material: product.material,
          inStock: product.inStock,
          isFeatured: product.isFeatured,
          isPublished: product.isPublished,
          videoUrl: product.videoUrl,
          marketplaceUrl: product.marketplaceUrl,
          images: product.images,
        }}
      />
    </>
  );
}
