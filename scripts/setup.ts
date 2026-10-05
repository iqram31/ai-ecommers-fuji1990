// Menyiapkan Supabase: bucket storage publik "media" dan akun admin.
// Jalankan: npm run setup   (membaca .env)
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

const BUCKET = "media";

async function main() {
  if (!url || !serviceKey) {
    throw new Error("Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env terlebih dahulu.");
  }
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  // 1. Bucket storage
  const bucketOptions = {
    public: true,
    fileSizeLimit: 50 * 1024 * 1024,
    allowedMimeTypes: ["image/webp", "image/jpeg", "image/png", "image/avif", "video/mp4"],
  };
  const { data: bucket } = await supabase.storage.getBucket(BUCKET);
  const { error: bucketError } = bucket
    ? await supabase.storage.updateBucket(BUCKET, bucketOptions)
    : await supabase.storage.createBucket(BUCKET, bucketOptions);
  if (bucketError) throw bucketError;
  console.log(`Bucket "${BUCKET}" siap.`);

  // 2. Akun admin
  if (!email || !password) {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD kosong, pembuatan akun admin dilewati.");
    return;
  }
  if (password.length < 10) throw new Error("ADMIN_PASSWORD minimal 10 karakter.");

  const { data: list, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) throw listError;
  const existing = list.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());

  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      app_metadata: { ...existing.app_metadata, role: "admin" },
    });
    if (error) throw error;
    console.log(`Akun ${email} diperbarui sebagai admin.`);
  } else {
    const { error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: "admin" },
    });
    if (error) throw error;
    console.log(`Akun admin ${email} dibuat.`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
