import "server-only";
import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { hasSupabase } from "./supabase/config";
import { createSupabaseServerClient } from "./supabase/server";

/** Admin = pengguna Supabase dengan `app_metadata.role === "admin"` (hanya bisa diatur lewat service role). */
export function isAdmin(user: User | null | undefined): user is User {
  return user?.app_metadata?.role === "admin";
}

export async function getAdminUser(): Promise<User | null> {
  if (!hasSupabase) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return isAdmin(data.user) ? data.user : null;
}

/** Untuk halaman admin: alihkan ke login bila belum masuk. */
export async function requireAdminPage(): Promise<User> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** Untuk server action: lempar error bila bukan admin. */
export async function requireAdmin(): Promise<User> {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
