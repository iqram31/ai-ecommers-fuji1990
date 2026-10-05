/* eslint-disable @next/next/no-img-element -- thumbnail admin */
import type { Metadata } from "next";
import Link from "next/link";
import { deleteBannerAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/form";
import { Badge, EmptyState, PageHeader, StatusBanner } from "@/components/admin/ui";
import { hasDatabase, prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Banner" };

export default async function AdminBannersPage({ searchParams }: PageProps<"/admin/banner">) {
  const { status } = await searchParams;
  const banners = hasDatabase
    ? await prisma.banner.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] })
    : [];

  return (
    <>
      <PageHeader
        title="Banner"
        description="Slide besar di bagian atas beranda."
        action={{ href: "/admin/banner/baru", label: "Tambah banner" }}
      />
      <StatusBanner status={status} />

      {banners.length === 0 ? (
        <EmptyState>Belum ada banner.</EmptyState>
      ) : (
        <ul className="divide-y divide-line border border-line bg-white">
          {banners.map((banner) => (
            <li key={banner.id} className="flex items-center gap-4 p-3">
              <img src={banner.imageUrl} alt="" className="aspect-[2/1] w-28 shrink-0 bg-sand object-cover sm:w-40" />
              <div className="min-w-0 flex-1">
                <Link href={`/admin/banner/${banner.id}`} className="font-semibold hover:text-fuji">
                  {banner.title}
                </Link>
                <p className="mt-0.5 truncate text-sm text-muted">
                  Urutan {banner.sortOrder}
                  {banner.linkUrl && ` · ${banner.linkUrl}`}
                </p>
                <p className="mt-1.5">
                  <Badge tone={banner.isActive ? "green" : "gray"}>{banner.isActive ? "Tampil" : "Disembunyikan"}</Badge>
                </p>
              </div>
              <Link href={`/admin/banner/${banner.id}`} className="hidden text-sm font-semibold underline underline-offset-4 sm:block">
                Edit
              </Link>
              <DeleteButton action={deleteBannerAction.bind(null, banner.id)} label={banner.title} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
