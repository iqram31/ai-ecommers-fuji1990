import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="heading mt-2">Halaman tidak ditemukan</h1>
      <p className="mt-3 max-w-md text-muted">Halaman yang kamu cari sudah dipindahkan atau tidak tersedia lagi.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">
          Ke beranda
        </Link>
        <Link href="/produk" className="btn btn-outline">
          Lihat produk
        </Link>
      </div>
    </div>
  );
}
