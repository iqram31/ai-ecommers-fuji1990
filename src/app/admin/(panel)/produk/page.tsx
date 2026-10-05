/* eslint-disable @next/next/no-img-element -- thumbnail admin */
import type { Metadata } from "next";
import Link from "next/link";
import { deleteProductAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/form";
import { Badge, EmptyState, PageHeader, StatusBanner } from "@/components/admin/ui";
import { hasDatabase, prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/utils";

export const metadata: Metadata = { title: "Produk" };

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/produk">) {
  const { status } = await searchParams;
  const products = hasDatabase
    ? await prisma.product.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
          category: { select: { name: true } },
          images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
        },
      })
    : [];

  return (
    <>
      <PageHeader
        title="Produk"
        description={`${products.length} produk`}
        action={{ href: "/admin/produk/baru", label: "Tambah produk" }}
      />
      <StatusBanner status={status} />

      {products.length === 0 ? (
        <EmptyState>Belum ada produk. Tambahkan produk pertama kamu.</EmptyState>
      ) : (
        <ul className="divide-y divide-line border border-line bg-white">
          {products.map((product) => (
            <li key={product.id} className="flex items-center gap-4 p-3">
              {product.images[0] ? (
                <img src={product.images[0].url} alt="" className="size-16 shrink-0 bg-sand object-cover" />
              ) : (
                <span className="size-16 shrink-0 bg-sand" />
              )}
              <div className="min-w-0 flex-1">
                <Link href={`/admin/produk/${product.id}`} className="font-semibold hover:text-fuji">
                  {product.name}
                </Link>
                <p className="mt-0.5 text-sm text-muted">
                  {product.category.name} · {formatRupiah(product.price)}
                </p>
                <p className="mt-1.5 flex flex-wrap gap-1.5">
                  <Badge tone={product.isPublished ? "green" : "gray"}>{product.isPublished ? "Tampil" : "Draf"}</Badge>
                  {!product.inStock && <Badge tone="red">Stok habis</Badge>}
                  {product.isFeatured && <Badge tone="gray">Unggulan</Badge>}
                </p>
              </div>
              <Link href={`/admin/produk/${product.id}`} className="hidden text-sm font-semibold underline underline-offset-4 sm:block">
                Edit
              </Link>
              <DeleteButton action={deleteProductAction.bind(null, product.id)} label={product.name} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
