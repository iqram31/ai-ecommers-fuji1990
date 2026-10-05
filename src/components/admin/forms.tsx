"use client";

import Link from "next/link";
import { useState } from "react";
import {
  loginAction,
  saveBannerAction,
  saveCategoryAction,
  savePageAction,
  saveProductAction,
  saveSettingsAction,
} from "@/app/admin/actions";
import type { StoreSettings } from "@/lib/data";
import { slugify } from "@/lib/utils";
import { displayWhatsapp } from "@/lib/whatsapp";
import { CheckboxField, Field, FormAlert, SubmitButton, TextAreaField, TextField, useAdminForm } from "./form";
import { ProductImagesInput, SingleMediaInput, type ProductImageValue } from "./media-input";

const CONTENT_HINT = "Format: “## Judul bagian”, “- butir daftar”, **tebal**. Satu baris = satu paragraf.";

function FormActions({ pending, cancelHref }: { pending: boolean; cancelHref: string }) {
  return (
    <div className="flex items-center gap-3 border-t border-line pt-6">
      <SubmitButton pending={pending} />
      <Link href={cancelHref} className="btn btn-outline">
        Batal
      </Link>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5 border border-line bg-white p-5 sm:p-6">
      <h2 className="font-display text-2xl tracking-wide">{title}</h2>
      {children}
    </section>
  );
}

/** Nama + slug: slug mengikuti nama sampai admin mengubahnya sendiri. */
function NameAndSlug({
  field = "name",
  nameLabel,
  initialName,
  initialSlug,
  slugPrefix,
  errors,
}: {
  field?: "name" | "title";
  nameLabel: string;
  initialName: string;
  initialSlug: string;
  slugPrefix: string;
  errors?: Record<string, string[] | undefined>;
}) {
  const [slug, setSlug] = useState(initialSlug);
  const [touched, setTouched] = useState(Boolean(initialSlug));
  return (
    <>
      <TextField
        label={nameLabel}
        name={field}
        defaultValue={initialName}
        required
        errors={errors?.[field]}
        onChange={(event) => {
          if (!touched) setSlug(slugify(event.target.value));
        }}
      />
      <TextField
        label="Slug (alamat URL)"
        name="slug"
        value={slug}
        required
        hint={`${slugPrefix}${slug || "…"}`}
        errors={errors?.slug}
        onChange={(event) => {
          setTouched(true);
          setSlug(event.target.value);
        }}
      />
    </>
  );
}

// ---- Login --------------------------------------------------------------------

export function LoginForm() {
  const { state, pending, onSubmit } = useAdminForm(loginAction);
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormAlert state={state} />
      <TextField label="Email" name="email" type="email" autoComplete="username" required errors={state.errors?.email} />
      <TextField
        label="Kata sandi"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        errors={state.errors?.password}
      />
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Memeriksa…" : "Masuk"}
      </button>
    </form>
  );
}

// ---- Produk -------------------------------------------------------------------

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  price: number | null;
  compareAtPrice: number | null;
  sizes: string[];
  colors: string[];
  material: string | null;
  inStock: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  videoUrl: string | null;
  marketplaceUrl: string | null;
  images: ProductImageValue[];
};

export function ProductForm({
  product,
  categories,
}: {
  product: ProductFormValues;
  categories: { id: string; name: string }[];
}) {
  const { state, pending, onSubmit } = useAdminForm(saveProductAction);
  const errors = state.errors;

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {product.id && <input type="hidden" name="id" value={product.id} />}
      <FormAlert state={state} />

      <Section title="Informasi produk">
        <NameAndSlug
          nameLabel="Nama produk"
          initialName={product.name}
          initialSlug={product.slug}
          slugPrefix="/produk/"
          errors={errors}
        />
        <Field label="Kategori" errors={errors?.categoryId}>
          {(props) => (
            <select {...props} name="categoryId" defaultValue={product.categoryId} required className="input">
              <option value="" disabled>
                Pilih kategori
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
        </Field>
        <TextAreaField
          label="Deskripsi"
          name="description"
          rows={10}
          defaultValue={product.description}
          required
          hint={CONTENT_HINT}
          errors={errors?.description}
        />
        <TextField
          label="Material"
          name="material"
          optional
          defaultValue={product.material ?? ""}
          errors={errors?.material}
        />
      </Section>

      <Section title="Harga & varian">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Harga jual (Rp)"
            name="price"
            type="number"
            inputMode="numeric"
            min={0}
            step={1000}
            defaultValue={product.price ?? ""}
            required
            errors={errors?.price}
          />
          <TextField
            label="Harga coret (Rp)"
            name="compareAtPrice"
            type="number"
            inputMode="numeric"
            min={0}
            step={1000}
            optional
            defaultValue={product.compareAtPrice ?? ""}
            hint="Isi bila sedang diskon. Harus lebih besar dari harga jual."
            errors={errors?.compareAtPrice}
          />
        </div>
        <TextField
          label="Ukuran"
          name="sizes"
          optional
          defaultValue={product.sizes.join(", ")}
          hint="Pisahkan dengan koma. Contoh: S, M, L, XL"
          errors={errors?.sizes}
        />
        <TextField
          label="Warna"
          name="colors"
          optional
          defaultValue={product.colors.join(", ")}
          hint="Pisahkan dengan koma. Contoh: Olive, Black"
          errors={errors?.colors}
        />
      </Section>

      <Section title="Media">
        <ProductImagesInput initial={product.images} errors={errors?.images} />
        <SingleMediaInput
          name="videoUrl"
          label="Video produk (opsional)"
          hint="MP4, maksimal 50 MB."
          folder="products"
          kind="video"
          initial={product.videoUrl}
          errors={errors?.videoUrl}
        />
      </Section>

      <Section title="Status">
        <CheckboxField
          label="Tampilkan di toko"
          hint="Nonaktifkan untuk menyimpan sebagai draf."
          name="isPublished"
          defaultChecked={product.isPublished}
        />
        <CheckboxField label="Stok tersedia" name="inStock" defaultChecked={product.inStock} />
        <CheckboxField
          label="Produk unggulan"
          hint="Ditampilkan di beranda."
          name="isFeatured"
          defaultChecked={product.isFeatured}
        />
        <TextField
          label="Link marketplace"
          name="marketplaceUrl"
          type="url"
          optional
          defaultValue={product.marketplaceUrl ?? ""}
          hint="Contoh: link produk di Shopee."
          errors={errors?.marketplaceUrl}
        />
      </Section>

      <FormActions pending={pending} cancelHref="/admin/produk" />
    </form>
  );
}

// ---- Kategori -----------------------------------------------------------------

export type CategoryFormValues = {
  id?: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
};

export function CategoryForm({ category }: { category: CategoryFormValues }) {
  const { state, pending, onSubmit } = useAdminForm(saveCategoryAction);
  const errors = state.errors;

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {category.id && <input type="hidden" name="id" value={category.id} />}
      <FormAlert state={state} />
      <Section title="Kategori">
        <NameAndSlug
          nameLabel="Nama kategori"
          initialName={category.name}
          initialSlug={category.slug}
          slugPrefix="/produk?kategori="
          errors={errors}
        />
        <TextField
          label="Deskripsi singkat"
          name="description"
          optional
          defaultValue={category.description ?? ""}
          errors={errors?.description}
        />
        <TextField
          label="Urutan"
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={category.sortOrder}
          hint="Angka kecil tampil lebih dulu."
          errors={errors?.sortOrder}
        />
        <SingleMediaInput
          name="imageUrl"
          label="Gambar kategori (opsional)"
          hint="Ditampilkan di beranda. Rasio potret 3:4 paling pas."
          folder="categories"
          initial={category.imageUrl}
          errors={errors?.imageUrl}
        />
      </Section>
      <FormActions pending={pending} cancelHref="/admin/kategori" />
    </form>
  );
}

// ---- Banner -------------------------------------------------------------------

export type BannerFormValues = {
  id?: string;
  title: string;
  imageUrl: string | null;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

export function BannerForm({ banner }: { banner: BannerFormValues }) {
  const { state, pending, onSubmit } = useAdminForm(saveBannerAction);
  const errors = state.errors;

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {banner.id && <input type="hidden" name="id" value={banner.id} />}
      <FormAlert state={state} />
      <Section title="Banner">
        <SingleMediaInput
          name="imageUrl"
          label="Gambar banner"
          hint="Rasio 2:1 (misalnya 2000 × 1000 px), maksimal 8 MB."
          folder="banners"
          initial={banner.imageUrl}
          errors={errors?.imageUrl}
        />
        <TextField
          label="Judul"
          name="title"
          defaultValue={banner.title}
          required
          hint="Dipakai sebagai teks alt gambar untuk pembaca layar dan SEO."
          errors={errors?.title}
        />
        <TextField
          label="Link tujuan"
          name="linkUrl"
          optional
          defaultValue={banner.linkUrl ?? ""}
          hint="Contoh: /produk?kategori=jaket atau /produk/nama-produk"
          errors={errors?.linkUrl}
        />
        <TextField
          label="Urutan"
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={banner.sortOrder}
          hint="Angka kecil tampil lebih dulu."
          errors={errors?.sortOrder}
        />
        <CheckboxField label="Tampilkan di beranda" name="isActive" defaultChecked={banner.isActive} />
      </Section>
      <FormActions pending={pending} cancelHref="/admin/banner" />
    </form>
  );
}

// ---- Halaman ------------------------------------------------------------------

export type PageFormValues = {
  id?: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  showInFooter: boolean;
};

export function PageForm({ page }: { page: PageFormValues }) {
  const { state, pending, onSubmit } = useAdminForm(savePageAction);
  const errors = state.errors;

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {page.id && <input type="hidden" name="id" value={page.id} />}
      <FormAlert state={state} />
      <Section title="Halaman">
        <NameAndSlug
          field="title"
          nameLabel="Judul"
          initialName={page.title}
          initialSlug={page.slug}
          slugPrefix="/info/"
          errors={errors}
        />
        <TextAreaField
          label="Isi halaman"
          name="content"
          rows={16}
          defaultValue={page.content}
          required
          hint={CONTENT_HINT}
          errors={errors?.content}
        />
        <CheckboxField label="Terbitkan" name="isPublished" defaultChecked={page.isPublished} />
        <CheckboxField label="Tampilkan link di footer" name="showInFooter" defaultChecked={page.showInFooter} />
      </Section>
      <FormActions pending={pending} cancelHref="/admin/halaman" />
    </form>
  );
}

// ---- Pengaturan ---------------------------------------------------------------

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const { state, pending, onSubmit } = useAdminForm(saveSettingsAction);
  const errors = state.errors;

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <FormAlert state={state} />

      <Section title="Kontak & order">
        <TextField
          label="Nomor WhatsApp order"
          name="whatsappNumber"
          type="tel"
          inputMode="tel"
          defaultValue={displayWhatsapp(settings.whatsappNumber)}
          required
          hint="Semua tombol order mengarah ke nomor ini. Contoh: 0852-1234-1684"
          errors={errors?.whatsappNumber}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Email" name="email" type="email" optional defaultValue={settings.email ?? ""} errors={errors?.email} />
          <TextField
            label="Jam operasional"
            name="openHours"
            optional
            defaultValue={settings.openHours ?? ""}
            errors={errors?.openHours}
          />
        </div>
        <TextField label="Alamat" name="address" optional defaultValue={settings.address ?? ""} errors={errors?.address} />
      </Section>

      <Section title="Identitas toko">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Nama toko" name="storeName" defaultValue={settings.storeName} required errors={errors?.storeName} />
          <TextField label="Tagline" name="tagline" defaultValue={settings.tagline} required errors={errors?.tagline} />
        </div>
        <TextAreaField
          label="Deskripsi toko"
          name="description"
          rows={3}
          defaultValue={settings.description}
          required
          hint="Tampil di footer dan hasil pencarian Google."
          errors={errors?.description}
        />
        <TextField
          label="Teks pengumuman"
          name="announcement"
          optional
          defaultValue={settings.announcement ?? ""}
          hint="Baris hitam di bagian paling atas situs. Kosongkan untuk menyembunyikan."
          errors={errors?.announcement}
        />
      </Section>

      <Section title="Media sosial & marketplace">
        <TextField
          label="Instagram"
          name="instagramUrl"
          type="url"
          optional
          defaultValue={settings.instagramUrl ?? ""}
          placeholder="https://instagram.com/…"
          errors={errors?.instagramUrl}
        />
        <TextField
          label="TikTok"
          name="tiktokUrl"
          type="url"
          optional
          defaultValue={settings.tiktokUrl ?? ""}
          placeholder="https://tiktok.com/@…"
          errors={errors?.tiktokUrl}
        />
        <TextField
          label="Shopee"
          name="shopeeUrl"
          type="url"
          optional
          defaultValue={settings.shopeeUrl ?? ""}
          placeholder="https://shopee.co.id/…"
          errors={errors?.shopeeUrl}
        />
      </Section>

      <Section title="Cerita brand">
        <TextField label="Judul" name="aboutTitle" defaultValue={settings.aboutTitle} required errors={errors?.aboutTitle} />
        <TextAreaField
          label="Cerita"
          name="aboutBody"
          rows={10}
          defaultValue={settings.aboutBody}
          required
          hint="Tampil di halaman Tentang. Paragraf pertama juga tampil di beranda. Pisahkan paragraf dengan baris kosong."
          errors={errors?.aboutBody}
        />
      </Section>

      <div className="border-t border-line pt-6">
        <SubmitButton pending={pending}>Simpan pengaturan</SubmitButton>
      </div>
    </form>
  );
}
