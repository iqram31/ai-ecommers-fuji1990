# FUJI 1995 — Toko Online

Website e-commerce untuk FUJI 1995, brand clothing asal Bandung (jaket, celana, baju).
Pembeli memilih produk di situs, lalu pesanan dikirim ke admin lewat WhatsApp.

**Stack:** Next.js 16 (App Router) · Tailwind CSS 4 · Supabase (Postgres, Auth, Storage) · Prisma 6 · Vercel

## Fitur

**Toko**

- Beranda: banner slide, kategori, produk unggulan, rilisan terbaru, cerita brand
- Katalog `/produk`: filter kategori, pencarian, urutan harga/nama/terbaru, paginasi
- Detail produk: galeri foto + video, pilihan ukuran/warna, jumlah, harga coret/diskon
- Keranjang (tersimpan di browser) dan **checkout via WhatsApp** dengan pesan pesanan otomatis
- Tombol WhatsApp mengambang, halaman Tentang, Kontak, dan halaman informasi (cara order, panduan ukuran, dst.)
- SEO: metadata, Open Graph, JSON-LD produk, `sitemap.xml`, `robots.txt`

**Admin** (`/admin`)

- Login dengan Supabase Auth (hanya akun ber-role `admin`)
- Kelola **produk** (foto, video, harga, ukuran, warna, stok, unggulan, draf)
- Kelola **kategori**, **banner** beranda, dan **halaman** informasi
- **Pengaturan**: nomor WhatsApp order, nama toko, pengumuman, media sosial, cerita brand
- Unggah gambar/video langsung ke Supabase Storage

Perubahan dari admin langsung tampil di toko (revalidasi on-demand).

## Menjalankan secara lokal

Butuh Node.js 20.9+.

```bash
npm install
cp .env.example .env   # lalu isi nilainya
npm run db:migrate     # membuat tabel di Supabase
npm run db:seed        # mengisi data awal (produk, banner, halaman, pengaturan)
npm run setup          # membuat bucket storage "media" + akun admin
npm run dev
```

Buka <http://localhost:3000>. Panel admin ada di <http://localhost:3000/admin>.

> **Mode demo.** Tanpa `DATABASE_URL`, toko tetap berjalan memakai katalog contoh dari
> `src/lib/seed-data.ts` (hanya-baca). Panel admin membutuhkan Supabase.

### Variabel lingkungan

| Variabel | Keterangan |
| --- | --- |
| `DATABASE_URL` | Koneksi Postgres Supabase lewat *transaction pooler* (port 6543) + `?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL` | Koneksi *session pooler*/direct (port 5432), dipakai Prisma Migrate |
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — **rahasia**, hanya di server |
| `NEXT_PUBLIC_SITE_URL` | URL publik situs, mis. `https://domainkamu.com` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Hanya untuk `npm run setup` (min. 10 karakter) |

## Deploy ke Vercel

1. Buat project di [Supabase](https://supabase.com), salin connection string dan API key.
2. Import repository ini di [Vercel](https://vercel.com/new).
3. Isi Environment Variables di Vercel (semua variabel di atas kecuali `ADMIN_EMAIL`/`ADMIN_PASSWORD`).
4. Deploy. Build di Vercel otomatis menerapkan migrasi database, dan mengisi data awal bila database masih kosong.
5. Dari komputer lokal (dengan `.env` terisi), jalankan `npm run setup` sekali untuk membuat bucket storage dan akun admin.

Disarankan: di Supabase → Authentication → Sign In / Providers, **matikan "Allow new users to sign up"**.
(Pendaftar baru tetap tidak bisa masuk admin karena tidak punya role `admin`, tapi lebih rapi dimatikan.)

## Keamanan

- Admin ditentukan oleh `app_metadata.role = "admin"` pada user Supabase — hanya bisa diatur dengan service role (`npm run setup`).
- Setiap server action admin memeriksa ulang sesi (`requireAdmin`), dan `src/proxy.ts` menjaga rute `/admin`.
- Row Level Security aktif di semua tabel tanpa policy, sehingga anon key tidak bisa mengakses tabel lewat REST API Supabase. Aplikasi mengakses data hanya lewat Prisma di server.
- Unggahan memakai signed upload URL berumur pendek; bucket membatasi tipe berkas (gambar/MP4) dan ukuran.
- Input divalidasi dengan Zod; URL gambar dibatasi ke `/public` atau bucket Supabase milik toko.

## Struktur

```
prisma/              schema, migrasi, seed
scripts/setup.ts     bucket storage + akun admin
public/              logo, banner, foto & video produk awal
src/app/(store)/     halaman toko
src/app/admin/       panel admin + server actions
src/components/      komponen toko & admin
src/lib/             data access, auth, validasi, WhatsApp, Supabase client
src/proxy.ts         penjaga rute /admin (pengganti middleware di Next.js 16)
```

## Skrip

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan |
| `npm run build` / `npm start` | Build & jalankan produksi |
| `npm run lint` / `npm run typecheck` | Pemeriksaan kode |
| `npm run db:migrate` | Terapkan migrasi ke database |
| `npm run db:seed` | Isi data awal (aman diulang) |
| `npm run setup` | Siapkan bucket storage & akun admin |
