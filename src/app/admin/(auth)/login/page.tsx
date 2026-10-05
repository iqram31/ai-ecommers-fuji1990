import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/admin/forms";
import { Logo } from "@/components/store/brand";
import { getSettings } from "@/lib/data";
import { hasSupabase } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Masuk Admin", robots: { index: false, follow: false } };

export default async function LoginPage() {
  const settings = await getSettings();

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm border border-line bg-white p-8">
        <Logo name={settings.storeName} />
        <h1 className="mt-6 font-display text-3xl tracking-wide">Masuk admin</h1>

        {hasSupabase ? (
          <div className="mt-6">
            <LoginForm />
          </div>
        ) : (
          <p role="alert" className="mt-6 border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Supabase belum dikonfigurasi. Isi <code>NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, dan <code>SUPABASE_SERVICE_ROLE_KEY</code>, lalu jalankan{" "}
            <code>npm run setup</code> untuk membuat akun admin.
          </p>
        )}

        <Link href="/" className="mt-6 inline-block text-sm text-muted underline underline-offset-4 hover:text-ink">
          ← Kembali ke toko
        </Link>
      </div>
    </main>
  );
}
