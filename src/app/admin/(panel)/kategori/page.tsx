import type { Metadata } from "next";
import Link from "next/link";
import { deleteCategoryAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/form";
import { EmptyState, PageHeader, StatusBanner } from "@/components/admin/ui";
import { hasDatabase, prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Kategori" };

export default async function AdminCategoriesPage({ searchParams }: PageProps<"/admin/kategori">) {
  const { status } = await searchParams;
  const categories = hasDatabase
    ? await prisma.category.findMany({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: { _count: { select: { products: true } } },
      })
    : [];

  return (
    <>
      <PageHeader title="Kategori" action={{ href: "/admin/kategori/baru", label: "Tambah kategori" }} />
      <StatusBanner status={status} />

      {categories.length === 0 ? (
        <EmptyState>Belum ada kategori.</EmptyState>
      ) : (
        <ul className="divide-y divide-line border border-line bg-white">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <Link href={`/admin/kategori/${category.id}`} className="font-semibold hover:text-fuji">
                  {category.name}
                </Link>
                <p className="mt-0.5 text-sm text-muted">
                  {category._count.products} produk · urutan {category.sortOrder}
                </p>
              </div>
              <Link href={`/admin/kategori/${category.id}`} className="text-sm font-semibold underline underline-offset-4">
                Edit
              </Link>
              <DeleteButton action={deleteCategoryAction.bind(null, category.id)} label={category.name} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
