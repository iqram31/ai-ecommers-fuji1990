"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { hasDatabase, prisma } from "@/lib/prisma";
import { hasSupabase, STORAGE_BUCKET, storagePublicPrefix } from "@/lib/supabase/config";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import {
  bannerSchema,
  categorySchema,
  loginSchema,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  pageSchema,
  productSchema,
  settingsSchema,
  uploadSchema,
  type FormState,
} from "@/lib/validation";

const NO_DATABASE: FormState = { message: "Database belum dikonfigurasi. Atur DATABASE_URL terlebih dahulu." };

function invalid(error: z.ZodError): FormState {
  return { message: "Periksa kembali isian yang ditandai.", errors: z.flattenError(error).fieldErrors };
}

function isUniqueViolation(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

const SLUG_TAKEN: FormState = {
  message: "Periksa kembali isian yang ditandai.",
  errors: { slug: ["Slug sudah dipakai. Gunakan slug lain."] },
};

/** Segarkan seluruh halaman toko setelah konten berubah. */
function revalidateStore() {
  revalidatePath("/", "layout");
}

/** Hapus berkas dari bucket bila URL-nya milik storage toko (best effort). */
async function removeStorageFiles(urls: (string | null | undefined)[]) {
  if (!storagePublicPrefix) return;
  const paths = urls
    .filter((url): url is string => Boolean(url && url.startsWith(storagePublicPrefix)))
    .map((url) => decodeURIComponent(url.slice(storagePublicPrefix.length)));
  if (paths.length === 0) return;
  try {
    await createSupabaseAdminClient().storage.from(STORAGE_BUCKET).remove(paths);
  } catch (error) {
    console.error("Gagal menghapus berkas storage", error);
  }
}

// ---- Auth ---------------------------------------------------------------------

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!hasSupabase) return { message: "Supabase belum dikonfigurasi." };
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { message: "Email atau kata sandi salah." };
  if (!isAdmin(data.user)) {
    await supabase.auth.signOut();
    return { message: "Akun ini tidak memiliki akses admin." };
  }
  redirect("/admin");
}

export async function logoutAction() {
  if (hasSupabase) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

// ---- Unggah berkas ------------------------------------------------------------

export type UploadTicket = { path: string; token: string; publicUrl: string } | { error: string };

export async function createUploadTicket(input: z.input<typeof uploadSchema>): Promise<UploadTicket> {
  await requireAdmin();
  const parsed = uploadSchema.safeParse(input);
  if (!parsed.success) return { error: "Format berkas tidak didukung. Gunakan WEBP, JPG, PNG, AVIF, atau MP4." };

  const { folder, fileName, contentType, size } = parsed.data;
  const isVideo = contentType === "video/mp4";
  if (size > (isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES)) {
    return { error: isVideo ? "Ukuran video maksimal 50 MB." : "Ukuran gambar maksimal 8 MB." };
  }

  const extension = contentType.split("/")[1].replace("jpeg", "jpg");
  const base = slugify(fileName.replace(/\.[^.]+$/, "")) || "file";
  const path = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${base}.${extension}`;

  try {
    const { data, error } = await createSupabaseAdminClient()
      .storage.from(STORAGE_BUCKET)
      .createSignedUploadUrl(path);
    if (error || !data) throw error ?? new Error("No upload URL");
    return { path: data.path, token: data.token, publicUrl: `${storagePublicPrefix}${data.path}` };
  } catch (error) {
    console.error("Gagal membuat URL unggah", error);
    return { error: "Storage belum siap. Jalankan `npm run setup` dan periksa SUPABASE_SERVICE_ROLE_KEY." };
  }
}

// ---- Produk -------------------------------------------------------------------

export async function saveProductAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  if (!hasDatabase) return NO_DATABASE;

  const id = formData.get("id")?.toString() || null;
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { images, ...data } = parsed.data;

  try {
    const previous = id
      ? await prisma.product.findUnique({
          where: { id },
          select: { videoUrl: true, images: { select: { url: true } } },
        })
      : null;
    if (id && !previous) return { message: "Produk tidak ditemukan." };

    const imageRows = images.map((image, index) => ({ ...image, sortOrder: index }));
    if (id) {
      await prisma.$transaction([
        prisma.productImage.deleteMany({ where: { productId: id } }),
        prisma.product.update({ where: { id }, data: { ...data, images: { create: imageRows } } }),
      ]);
    } else {
      await prisma.product.create({ data: { ...data, images: { create: imageRows } } });
    }

    if (previous) {
      const kept = new Set<string | null>([...images.map((image) => image.url), data.videoUrl]);
      const removed = [...previous.images.map((image) => image.url), previous.videoUrl].filter(
        (url) => !kept.has(url),
      );
      await removeStorageFiles(removed);
    }
  } catch (error) {
    if (isUniqueViolation(error)) return SLUG_TAKEN;
    console.error(error);
    return { message: "Produk gagal disimpan. Periksa kategori lalu coba lagi." };
  }

  revalidateStore();
  redirect("/admin/produk?status=tersimpan");
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  if (!hasDatabase) return;
  const product = await prisma.product.findUnique({
    where: { id },
    select: { videoUrl: true, images: { select: { url: true } } },
  });
  if (product) {
    await prisma.product.delete({ where: { id } });
    await removeStorageFiles([...product.images.map((image) => image.url), product.videoUrl]);
    revalidateStore();
  }
  redirect("/admin/produk?status=terhapus");
}

// ---- Kategori -----------------------------------------------------------------

export async function saveCategoryAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  if (!hasDatabase) return NO_DATABASE;

  const id = formData.get("id")?.toString() || null;
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);

  try {
    if (id) {
      const previous = await prisma.category.findUnique({ where: { id }, select: { imageUrl: true } });
      await prisma.category.update({ where: { id }, data: parsed.data });
      if (previous && previous.imageUrl !== parsed.data.imageUrl) await removeStorageFiles([previous.imageUrl]);
    } else {
      await prisma.category.create({ data: parsed.data });
    }
  } catch (error) {
    if (isUniqueViolation(error)) return SLUG_TAKEN;
    console.error(error);
    return { message: "Kategori gagal disimpan. Coba lagi." };
  }

  revalidateStore();
  redirect("/admin/kategori?status=tersimpan");
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();
  if (!hasDatabase) return;
  const category = await prisma.category.findUnique({
    where: { id },
    select: { imageUrl: true, _count: { select: { products: true } } },
  });
  if (!category) redirect("/admin/kategori");
  if (category._count.products > 0) redirect("/admin/kategori?status=masih-dipakai");

  await prisma.category.delete({ where: { id } });
  await removeStorageFiles([category.imageUrl]);
  revalidateStore();
  redirect("/admin/kategori?status=terhapus");
}

// ---- Banner -------------------------------------------------------------------

export async function saveBannerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  if (!hasDatabase) return NO_DATABASE;

  const id = formData.get("id")?.toString() || null;
  const parsed = bannerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);

  try {
    if (id) {
      const previous = await prisma.banner.findUnique({ where: { id }, select: { imageUrl: true } });
      await prisma.banner.update({ where: { id }, data: parsed.data });
      if (previous && previous.imageUrl !== parsed.data.imageUrl) await removeStorageFiles([previous.imageUrl]);
    } else {
      await prisma.banner.create({ data: parsed.data });
    }
  } catch (error) {
    console.error(error);
    return { message: "Banner gagal disimpan. Coba lagi." };
  }

  revalidateStore();
  redirect("/admin/banner?status=tersimpan");
}

export async function deleteBannerAction(id: string) {
  await requireAdmin();
  if (!hasDatabase) return;
  const banner = await prisma.banner.findUnique({ where: { id }, select: { imageUrl: true } });
  if (banner) {
    await prisma.banner.delete({ where: { id } });
    await removeStorageFiles([banner.imageUrl]);
    revalidateStore();
  }
  redirect("/admin/banner?status=terhapus");
}

// ---- Halaman ------------------------------------------------------------------

export async function savePageAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  if (!hasDatabase) return NO_DATABASE;

  const id = formData.get("id")?.toString() || null;
  const parsed = pageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);

  try {
    if (id) await prisma.page.update({ where: { id }, data: parsed.data });
    else await prisma.page.create({ data: parsed.data });
  } catch (error) {
    if (isUniqueViolation(error)) return SLUG_TAKEN;
    console.error(error);
    return { message: "Halaman gagal disimpan. Coba lagi." };
  }

  revalidateStore();
  redirect("/admin/halaman?status=tersimpan");
}

export async function deletePageAction(id: string) {
  await requireAdmin();
  if (!hasDatabase) return;
  await prisma.page.deleteMany({ where: { id } });
  revalidateStore();
  redirect("/admin/halaman?status=terhapus");
}

// ---- Pengaturan ---------------------------------------------------------------

export async function saveSettingsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  if (!hasDatabase) return NO_DATABASE;

  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);

  try {
    await prisma.siteSetting.upsert({ where: { id: 1 }, update: parsed.data, create: { id: 1, ...parsed.data } });
  } catch (error) {
    console.error(error);
    return { message: "Pengaturan gagal disimpan. Coba lagi." };
  }

  revalidateStore();
  return { ok: true, message: "Pengaturan tersimpan." };
}
