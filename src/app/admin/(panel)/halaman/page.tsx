import type { Metadata } from "next";
import Link from "next/link";
import { deletePageAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/form";
import { Badge, EmptyState, PageHeader, StatusBanner } from "@/components/admin/ui";
import { hasDatabase, prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Halaman" };

export default async function AdminPagesPage({ searchParams }: PageProps<"/admin/halaman">) {
  const { status } = await searchParams;
  const pages = hasDatabase ? await prisma.page.findMany({ orderBy: { createdAt: "asc" } }) : [];

  return (
    <>
      <PageHeader
        title="Halaman"
        description="Halaman informasi seperti cara order dan panduan ukuran."
        action={{ href: "/admin/halaman/baru", label: "Tambah halaman" }}
      />
      <StatusBanner status={status} />

      {pages.length === 0 ? (
        <EmptyState>Belum ada halaman.</EmptyState>
      ) : (
        <ul className="divide-y divide-line border border-line bg-white">
          {pages.map((page) => (
            <li key={page.id} className="flex items-center gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <Link href={`/admin/halaman/${page.id}`} className="font-semibold hover:text-fuji">
                  {page.title}
                </Link>
                <p className="mt-0.5 text-sm text-muted">/info/{page.slug}</p>
                <p className="mt-1.5 flex gap-1.5">
                  <Badge tone={page.isPublished ? "green" : "gray"}>{page.isPublished ? "Terbit" : "Draf"}</Badge>
                  {page.showInFooter && <Badge tone="gray">Footer</Badge>}
                </p>
              </div>
              <Link href={`/admin/halaman/${page.id}`} className="text-sm font-semibold underline underline-offset-4">
                Edit
              </Link>
              <DeleteButton action={deletePageAction.bind(null, page.id)} label={page.title} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
