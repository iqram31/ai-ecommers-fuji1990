import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/forms";
import { PageHeader } from "@/components/admin/ui";
import { hasDatabase, prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Kategori" };

// `/admin/kategori/baru` membuat kategori baru; id lain mengedit kategori yang ada.
export default async function CategoryFormPage({ params }: PageProps<"/admin/kategori/[id]">) {
  const { id } = await params;

  if (id === "baru") {
    return (
      <>
        <PageHeader title="Tambah kategori" backHref="/admin/kategori" />
        <CategoryForm category={{ name: "", slug: "", description: null, imageUrl: null, sortOrder: 0 }} />
      </>
    );
  }

  const category = hasDatabase ? await prisma.category.findUnique({ where: { id } }) : null;
  if (!category) notFound();

  return (
    <>
      <PageHeader title="Edit kategori" description={category.name} backHref="/admin/kategori" />
      <CategoryForm
        category={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          imageUrl: category.imageUrl,
          sortOrder: category.sortOrder,
        }}
      />
    </>
  );
}
