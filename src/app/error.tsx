"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="eyebrow">Terjadi kesalahan</p>
      <h1 className="heading mt-2">Halaman gagal dimuat</h1>
      <p className="mt-3 max-w-md text-muted">Coba muat ulang. Kalau masih bermasalah, hubungi admin lewat WhatsApp.</p>
      <button type="button" onClick={reset} className="btn btn-primary mt-7">
        Coba lagi
      </button>
    </main>
  );
}
