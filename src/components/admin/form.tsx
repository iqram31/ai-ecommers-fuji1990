"use client";

import { useId, useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import type { FormState } from "@/lib/validation";
import { cn } from "@/lib/utils";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

/**
 * Menjalankan server action tanpa mereset isian form ketika validasi gagal
 * (form bawaan React 19 mengosongkan input tak-terkontrol setelah action).
 */
export function useAdminForm(action: Action) {
  const [state, setState] = useState<FormState>({});
  const [pending, startTransition] = useTransition();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await action({}, formData);
      if (result) setState(result);
    });
  };

  return { state, pending, onSubmit };
}

export function FormAlert({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={cn(
        "border px-4 py-3 text-sm font-medium",
        state.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800",
      )}
    >
      {state.message}
    </p>
  );
}

type FieldProps = {
  label: string;
  name: string;
  hint?: string;
  errors?: string[];
  optional?: boolean;
};

export function Field({
  label,
  hint,
  errors,
  optional,
  children,
}: Omit<FieldProps, "name"> & { children: (props: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean }) => React.ReactNode }) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, errors?.length && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {optional && <span className="ml-1 font-normal text-muted">(opsional)</span>}
      </label>
      <div className="mt-1.5">{children({ id, "aria-describedby": describedBy, "aria-invalid": errors?.length ? true : undefined })}</div>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {errors?.length ? (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-red-700">
          {errors.join(" ")}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  label,
  hint,
  errors,
  optional,
  ...input
}: FieldProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name">) {
  return (
    <Field label={label} hint={hint} errors={errors} optional={optional}>
      {(props) => <input {...props} {...input} className={cn("input", input.className)} />}
    </Field>
  );
}

export function TextAreaField({
  label,
  hint,
  errors,
  optional,
  ...textarea
}: FieldProps & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name">) {
  return (
    <Field label={label} hint={hint} errors={errors} optional={optional}>
      {(props) => <textarea rows={5} {...props} {...textarea} className={cn("input", textarea.className)} />}
    </Field>
  );
}

export function CheckboxField({
  label,
  hint,
  name,
  defaultChecked,
}: {
  label: string;
  hint?: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1.5">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-5 accent-ink" />
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
    </label>
  );
}

export function SubmitButton({ pending, children = "Simpan" }: { pending: boolean; children?: React.ReactNode }) {
  return (
    <button type="submit" disabled={pending} className="btn btn-primary">
      {pending && <Loader2 aria-hidden className="size-4 animate-spin" />}
      {pending ? "Menyimpan…" : children}
    </button>
  );
}

/** Tombol hapus dua langkah: klik pertama meminta konfirmasi. */
export function DeleteButton({ action, label }: { action: () => Promise<void>; label: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        aria-label={`Hapus ${label}`}
        onClick={() => setConfirming(true)}
        className="flex size-10 items-center justify-center text-muted hover:text-red-700"
      >
        <Trash2 aria-hidden className="size-4" />
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => action())}
        className="min-h-10 bg-red-700 px-3 font-semibold text-white hover:bg-red-800 disabled:opacity-50"
      >
        {pending ? "Menghapus…" : "Ya, hapus"}
      </button>
      <button type="button" disabled={pending} onClick={() => setConfirming(false)} className="min-h-10 px-2 underline">
        Batal
      </button>
    </span>
  );
}
