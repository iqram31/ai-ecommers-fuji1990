import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_MESSAGES: Record<string, { text: string; tone: "success" | "error" }> = {
  tersimpan: { text: "Perubahan tersimpan.", tone: "success" },
  terhapus: { text: "Data dihapus.", tone: "success" },
  "masih-dipakai": {
    text: "Kategori masih punya produk. Pindahkan atau hapus produknya terlebih dahulu.",
    tone: "error",
  },
};

export function StatusBanner({ status }: { status?: string | string[] }) {
  const message = typeof status === "string" ? STATUS_MESSAGES[status] : undefined;
  if (!message) return null;
  return (
    <p
      role={message.tone === "error" ? "alert" : "status"}
      className={cn(
        "mb-6 border px-4 py-3 text-sm font-medium",
        message.tone === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800",
      )}
    >
      {message.text}
    </p>
  );
}

export function PageHeader({
  title,
  description,
  action,
  backHref,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
  backHref?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {backHref && (
          <Link href={backHref} className="text-sm text-muted underline underline-offset-4 hover:text-ink">
            ← Kembali
          </Link>
        )}
        <h1 className="mt-1 font-display text-4xl tracking-wide">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action && (
        <Link href={action.href} className="btn btn-primary">
          <Plus aria-hidden className="size-4" /> {action.label}
        </Link>
      )}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="border border-dashed border-line bg-white px-6 py-12 text-center text-sm text-muted">{children}</p>;
}

export function Badge({ tone, children }: { tone: "green" | "gray" | "red"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap px-2 py-0.5 text-xs font-semibold",
        tone === "green" && "bg-emerald-100 text-emerald-800",
        tone === "gray" && "bg-stone-200 text-stone-700",
        tone === "red" && "bg-red-100 text-red-800",
      )}
    >
      {children}
    </span>
  );
}

/** Dipakai ketika DATABASE_URL belum diatur. */
export function DatabaseNotice() {
  return (
    <p role="alert" className="mb-6 border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      Database belum terhubung, jadi data tidak bisa disimpan. Atur <code>DATABASE_URL</code> dan{" "}
      <code>DIRECT_URL</code>, lalu jalankan <code>npm run db:migrate</code> dan <code>npm run db:seed</code>.
    </p>
  );
}
