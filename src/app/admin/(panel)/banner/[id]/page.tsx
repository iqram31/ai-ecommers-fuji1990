import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BannerForm } from "@/components/admin/forms";
import { PageHeader } from "@/components/admin/ui";
import { hasDatabase, prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Banner" };

// `/admin/banner/baru` membuat banner baru; id lain mengedit banner yang ada.
export default async function BannerFormPage({ params }: PageProps<"/admin/banner/[id]">) {
  const { id } = await params;

  if (id === "baru") {
    return (
      <>
        <PageHeader title="Tambah banner" backHref="/admin/banner" />
        <BannerForm banner={{ title: "", imageUrl: null, linkUrl: null, sortOrder: 0, isActive: true }} />
      </>
    );
  }

  const banner = hasDatabase ? await prisma.banner.findUnique({ where: { id } }) : null;
  if (!banner) notFound();

  return (
    <>
      <PageHeader title="Edit banner" description={banner.title} backHref="/admin/banner" />
      <BannerForm
        banner={{
          id: banner.id,
          title: banner.title,
          imageUrl: banner.imageUrl,
          linkUrl: banner.linkUrl,
          sortOrder: banner.sortOrder,
          isActive: banner.isActive,
        }}
      />
    </>
  );
}
