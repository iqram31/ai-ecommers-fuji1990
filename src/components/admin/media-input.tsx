"use client";

/* eslint-disable @next/next/no-img-element -- pratinjau admin memakai URL apa adanya */

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Upload, X } from "lucide-react";
import { createUploadTicket } from "@/app/admin/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { hasSupabase, STORAGE_BUCKET } from "@/lib/supabase/config";
import type { UploadFolder } from "@/lib/validation";

const IMAGE_TYPES = "image/webp,image/jpeg,image/png,image/avif";

async function uploadFile(folder: UploadFolder, file: File): Promise<{ url: string } | { error: string }> {
  if (!hasSupabase) return { error: "Supabase belum dikonfigurasi, unggahan tidak tersedia." };
  const ticket = await createUploadTicket({
    folder,
    fileName: file.name,
    contentType: file.type as never,
    size: file.size,
  });
  if ("error" in ticket) return { error: ticket.error };

  const { error } = await createSupabaseBrowserClient()
    .storage.from(STORAGE_BUCKET)
    .uploadToSignedUrl(ticket.path, ticket.token, file, { contentType: file.type });
  if (error) return { error: `Gagal mengunggah ${file.name}. Coba lagi.` };
  return { url: ticket.publicUrl };
}

function useUploader(folder: UploadFolder, onUploaded: (urls: string[]) => void) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const result = await uploadFile(folder, file);
      if ("error" in result) {
        setError(result.error);
        break;
      }
      urls.push(result.url);
    }
    if (urls.length > 0) onUploaded(urls);
    setUploading(false);
  };

  return { upload, uploading, error };
}

function UploadButton({
  accept,
  multiple,
  uploading,
  onFiles,
  children,
}: {
  accept: string;
  multiple?: boolean;
  uploading: boolean;
  onFiles: (files: FileList | null) => void;
  children: React.ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          onFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className="btn btn-outline">
        {uploading ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Upload aria-hidden className="size-4" />}
        {uploading ? "Mengunggah…" : children}
      </button>
    </>
  );
}

export type ProductImageValue = { url: string; alt: string | null };

/** Daftar foto produk: unggah banyak, atur urutan, isi teks alt. Foto pertama jadi foto utama. */
export function ProductImagesInput({ initial, errors }: { initial: ProductImageValue[]; errors?: string[] }) {
  const [images, setImages] = useState(initial);
  const { upload, uploading, error } = useUploader("products", (urls) =>
    setImages((current) => [...current, ...urls.map((url) => ({ url, alt: null }))]),
  );

  const move = (index: number, delta: number) =>
    setImages((current) => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  return (
    <fieldset>
      <legend className="text-sm font-semibold">Foto produk</legend>
      <p className="mt-1 text-xs text-muted">Foto pertama menjadi foto utama. WEBP/JPG/PNG, maksimal 8 MB per foto.</p>
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      {images.length > 0 && (
        <ul className="mt-3 space-y-2">
          {images.map((image, index) => (
            <li key={image.url} className="flex items-center gap-3 border border-line bg-white p-2">
              <img src={image.url} alt="" className="size-16 shrink-0 bg-sand object-cover" />
              <div className="min-w-0 flex-1">
                <label className="sr-only" htmlFor={`alt-${index}`}>
                  Teks alt foto {index + 1}
                </label>
                <input
                  id={`alt-${index}`}
                  value={image.alt ?? ""}
                  placeholder="Deskripsi singkat foto (teks alt)"
                  onChange={(event) =>
                    setImages((current) =>
                      current.map((item, itemIndex) => (itemIndex === index ? { ...item, alt: event.target.value } : item)),
                    )
                  }
                  className="input"
                />
                {index === 0 && <p className="mt-1 text-xs font-semibold text-fuji">Foto utama</p>}
              </div>
              <div className="flex shrink-0">
                <IconButton label={`Naikkan foto ${index + 1}`} disabled={index === 0} onClick={() => move(index, -1)}>
                  <ArrowUp aria-hidden className="size-4" />
                </IconButton>
                <IconButton
                  label={`Turunkan foto ${index + 1}`}
                  disabled={index === images.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown aria-hidden className="size-4" />
                </IconButton>
                <IconButton
                  label={`Hapus foto ${index + 1}`}
                  onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                >
                  <X aria-hidden className="size-4" />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3">
        <UploadButton accept={IMAGE_TYPES} multiple uploading={uploading} onFiles={upload}>
          Unggah foto
        </UploadButton>
      </div>
      <MediaErrors messages={[error, ...(errors ?? [])]} />
    </fieldset>
  );
}

/** Satu berkas (gambar banner/kategori atau video produk) dengan pratinjau. */
export function SingleMediaInput({
  name,
  label,
  hint,
  folder,
  kind = "image",
  initial,
  errors,
}: {
  name: string;
  label: string;
  hint?: string;
  folder: UploadFolder;
  kind?: "image" | "video";
  initial: string | null;
  errors?: string[];
}) {
  const [url, setUrl] = useState(initial ?? "");
  const { upload, uploading, error } = useUploader(folder, ([uploaded]) => setUrl(uploaded));

  return (
    <fieldset>
      <legend className="text-sm font-semibold">{label}</legend>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      <input type="hidden" name={name} value={url} />

      {url && (
        <div className="mt-3 flex items-start gap-3 border border-line bg-white p-2">
          {kind === "video" ? (
            <video src={url} controls preload="metadata" className="max-h-48 w-full max-w-xs bg-ink" />
          ) : (
            <img src={url} alt="" className="max-h-48 w-full max-w-md bg-sand object-contain" />
          )}
          <IconButton label={`Hapus ${label.toLowerCase()}`} onClick={() => setUrl("")}>
            <X aria-hidden className="size-4" />
          </IconButton>
        </div>
      )}

      <div className="mt-3">
        <UploadButton accept={kind === "video" ? "video/mp4" : IMAGE_TYPES} uploading={uploading} onFiles={upload}>
          {url ? "Ganti berkas" : kind === "video" ? "Unggah video" : "Unggah gambar"}
        </UploadButton>
      </div>
      <MediaErrors messages={[error, ...(errors ?? [])]} />
    </fieldset>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-10 shrink-0 items-center justify-center text-muted hover:text-ink disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function MediaErrors({ messages }: { messages: (string | null | undefined)[] }) {
  const visible = messages.filter(Boolean);
  if (visible.length === 0) return null;
  return (
    <p role="alert" className="mt-2 text-xs font-medium text-red-700">
      {visible.join(" ")}
    </p>
  );
}
