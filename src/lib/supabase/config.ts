export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey);

export const STORAGE_BUCKET = "media";

/** Awalan URL publik untuk berkas di bucket media. */
export const storagePublicPrefix = supabaseUrl
  ? `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${STORAGE_BUCKET}/`
  : "";
