import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageForm } from "@/components/admin/forms";
import { PageHeader } from "@/components/admin/ui";
import { hasDatabase, prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Halaman" };

// `/admin/halaman/baru` membuat halaman baru; id lain mengedit halaman yang ada.
export default async function PageFormPage({ params }: PageProps<"/admin/halaman/[id]">) {
  const { id } = await params;

  if (id === "baru") {
    return (
      <>
        <PageHeader title="Tambah halaman" backHref="/admin/halaman" />
        <PageForm page={{ title: "", slug: "", content: "", isPublished: true, showInFooter: true }} />
      </>
    );
  }

  const page = hasDatabase ? await prisma.page.findUnique({ where: { id } }) : null;
  if (!page) notFound();

  return (
    <>
      <PageHeader title="Edit halaman" description={page.title} backHref="/admin/halaman" />
      <PageForm
        page={{
          id: page.id,
          title: page.title,
          slug: page.slug,
          content: page.content,
          isPublished: page.isPublished,
          showInFooter: page.showInFooter,
        }}
      />
    </>
  );
}
