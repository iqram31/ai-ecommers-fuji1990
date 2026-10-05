// Build produksi. Di Vercel, migrasi database diterapkan lebih dulu supaya
// tabel selalu sesuai dengan kode yang di-deploy, dan database yang masih
// kosong diisi data awal satu kali.
import { execSync } from "node:child_process";

const run = (command, env = {}) =>
  execSync(command, { stdio: "inherit", env: { ...process.env, ...env } });

run("prisma generate");

if (process.env.VERCEL && process.env.DATABASE_URL) {
  if (!process.env.DIRECT_URL) {
    console.error(
      "\nDIRECT_URL belum diatur di Vercel. Isi dengan koneksi Supabase port 5432 " +
        "(session pooler/direct) agar migrasi database bisa dijalankan.\n",
    );
    process.exit(1);
  }
  run("prisma migrate deploy");
  run("tsx prisma/seed.ts", { SEED_ONLY_IF_EMPTY: "1" });
}

run("next build");
