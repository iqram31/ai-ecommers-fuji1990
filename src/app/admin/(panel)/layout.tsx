import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/nav";
import { DatabaseNotice } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth";
import { hasDatabase } from "@/lib/prisma";

// Area admin selalu dirender per-permintaan (bergantung pada sesi login).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminPage();

  return (
    <div className="flex flex-1 flex-col bg-sand/60 lg:flex-row">
      <aside className="shrink-0 bg-ink text-paper lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-60 lg:flex-col">
        <div className="flex items-center justify-between px-4 py-4 lg:block lg:px-5 lg:py-6">
          <Link href="/admin" className="font-display text-2xl tracking-wider">
            Admin toko
          </Link>
          <p className="hidden truncate text-xs text-paper/50 lg:mt-1 lg:block">{user.email}</p>
        </div>
        <AdminNav />
        <div className="hidden space-y-1 border-t border-paper/10 p-3 lg:mt-auto lg:block">
          <Link
            href="/"
            target="_blank"
            className="flex min-h-11 items-center gap-3 px-3 text-sm text-paper/70 hover:bg-paper/10 hover:text-paper"
          >
            <ExternalLink aria-hidden className="size-4" /> Lihat toko
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex min-h-11 w-full items-center gap-3 px-3 text-sm text-paper/70 hover:bg-paper/10 hover:text-paper"
            >
              <LogOut aria-hidden className="size-4" /> Keluar
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-4xl">
          {!hasDatabase && <DatabaseNotice />}
          {children}
          <form action={logoutAction} className="mt-12 border-t border-line pt-6 lg:hidden">
            <button type="submit" className="btn btn-outline">
              <LogOut aria-hidden className="size-4" /> Keluar
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
