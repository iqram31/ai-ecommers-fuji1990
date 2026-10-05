import { z } from "zod";
import { storagePublicPrefix } from "./supabase/config";
import { normalizeWhatsapp } from "./whatsapp";

export type FormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

const isLocalPath = (value: string) => /^\/(?!\/)/.test(value);
const isStorageUrl = (value: string) => Boolean(storagePublicPrefix) && value.startsWith(storagePublicPrefix);
const isHttpsUrl = (value: string) => {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

const emptyToNull = (value: unknown) => (typeof value === "string" && value.trim() === "" ? null : value);
const checkbox = z.preprocess((value) => value === "on" || value === "true" || value === true, z.boolean());

/** Berkas media harus berasal dari folder /public atau bucket Supabase milik toko. */
const mediaUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => isLocalPath(v) || isStorageUrl(v), "Gunakan berkas hasil unggahan atau path yang diawali garis miring (/).");

const linkUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => isLocalPath(v) || isHttpsUrl(v), "Isi dengan path (misalnya /produk) atau URL https.");

const externalUrl = z.string().trim().max(500).refine(isHttpsUrl, "Isi dengan URL https yang valid.");

const slug = z
  .string()
  .trim()
  .min(1, "Slug wajib diisi.")
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Hanya huruf kecil, angka, dan tanda hubung.");

const list = z.preprocess(
  (value) =>
    typeof value === "string"
      ? [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))]
      : value,
  z.array(z.string().max(30)).max(20),
);

const rupiah = z.coerce
  .number({ error: "Isi dengan angka." })
  .int("Harga harus bilangan bulat.")
  .min(0, "Harga tidak boleh negatif.")
  .max(100_000_000, "Harga terlalu besar.");

const sortOrder = z.coerce.number({ error: "Isi dengan angka." }).int().min(0).max(9999);

const images = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  },
  z
    .array(z.object({ url: mediaUrl, alt: z.preprocess(emptyToNull, z.string().trim().max(160).nullable()) }))
    .min(1, "Tambahkan minimal satu foto produk.")
    .max(12, "Maksimal 12 foto."),
);

export const productSchema = z
  .object({
    name: z.string().trim().min(2, "Nama produk wajib diisi.").max(120),
    slug,
    categoryId: z.string().min(1, "Pilih kategori."),
    description: z.string().trim().min(1, "Deskripsi wajib diisi.").max(5000),
    price: rupiah,
    compareAtPrice: z.preprocess(emptyToNull, rupiah.nullable()),
    sizes: list,
    colors: list,
    material: z.preprocess(emptyToNull, z.string().trim().max(120).nullable()),
    inStock: checkbox,
    isFeatured: checkbox,
    isPublished: checkbox,
    videoUrl: z.preprocess(emptyToNull, mediaUrl.nullable()),
    marketplaceUrl: z.preprocess(emptyToNull, externalUrl.nullable()),
    images,
  })
  .refine((data) => data.compareAtPrice == null || data.compareAtPrice > data.price, {
    path: ["compareAtPrice"],
    message: "Harga coret harus lebih besar dari harga jual.",
  });

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Nama kategori wajib diisi.").max(60),
  slug,
  description: z.preprocess(emptyToNull, z.string().trim().max(200).nullable()),
  imageUrl: z.preprocess(emptyToNull, mediaUrl.nullable()),
  sortOrder,
});

export const bannerSchema = z.object({
  title: z.string().trim().min(2, "Judul wajib diisi.").max(160),
  imageUrl: mediaUrl,
  linkUrl: z.preprocess(emptyToNull, linkUrl.nullable()),
  sortOrder,
  isActive: checkbox,
});

export const pageSchema = z.object({
  title: z.string().trim().min(2, "Judul wajib diisi.").max(120),
  slug,
  content: z.string().trim().min(1, "Isi halaman wajib diisi.").max(20000),
  isPublished: checkbox,
  showInFooter: checkbox,
});

export const settingsSchema = z.object({
  storeName: z.string().trim().min(2, "Nama toko wajib diisi.").max(60),
  tagline: z.string().trim().min(2, "Tagline wajib diisi.").max(120),
  description: z.string().trim().min(10, "Deskripsi minimal 10 karakter.").max(300),
  whatsappNumber: z
    .string()
    .transform(normalizeWhatsapp)
    .refine((v) => /^62\d{8,13}$/.test(v), "Nomor WhatsApp tidak valid. Contoh: 0852-1234-1684."),
  email: z.preprocess(emptyToNull, z.email("Email tidak valid.").max(120).nullable()),
  address: z.preprocess(emptyToNull, z.string().trim().max(300).nullable()),
  openHours: z.preprocess(emptyToNull, z.string().trim().max(120).nullable()),
  instagramUrl: z.preprocess(emptyToNull, externalUrl.nullable()),
  tiktokUrl: z.preprocess(emptyToNull, externalUrl.nullable()),
  shopeeUrl: z.preprocess(emptyToNull, externalUrl.nullable()),
  announcement: z.preprocess(emptyToNull, z.string().trim().max(160).nullable()),
  aboutTitle: z.string().trim().min(2, "Judul wajib diisi.").max(120),
  aboutBody: z.string().trim().min(10, "Cerita brand minimal 10 karakter.").max(5000),
});

export const loginSchema = z.object({
  email: z.email("Email tidak valid."),
  password: z.string().min(1, "Kata sandi wajib diisi."),
});

export const UPLOAD_FOLDERS = ["products", "banners", "categories"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export const uploadSchema = z.object({
  folder: z.enum(UPLOAD_FOLDERS),
  fileName: z.string().min(1).max(200),
  contentType: z.enum(["image/webp", "image/jpeg", "image/png", "image/avif", "video/mp4"]),
  size: z.number().int().positive(),
});

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
