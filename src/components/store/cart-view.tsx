"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { buildOrderMessage, whatsappLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./brand";
import { useStore } from "./store-context";

const noop = () => () => {};

export function CartView() {
  const { items, subtotal, storeName, whatsappNumber, setQuantity, removeItem, clear } = useStore();
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const [customer, setCustomer] = useState({ name: "", address: "", note: "" });
  const [error, setError] = useState<string | null>(null);

  if (!hydrated) {
    return <p className="mt-8 text-sm text-muted">Memuat keranjang…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 border border-dashed border-line px-6 py-16 text-center">
        <p className="font-display text-3xl tracking-wide">Keranjang masih kosong</p>
        <p className="mt-2 text-sm text-muted">Pilih produk dulu, lalu kirim pesanan lewat WhatsApp.</p>
        <Link href="/produk" className="btn btn-primary mt-6">
          Mulai belanja
        </Link>
      </div>
    );
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!customer.name.trim() || !customer.address.trim()) {
      setError("Isi nama dan alamat pengiriman terlebih dahulu.");
      return;
    }
    setError(null);
    const message = buildOrderMessage(
      storeName,
      items.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        url: `${window.location.origin}/produk/${item.slug}`,
      })),
      { name: customer.name.trim(), address: customer.address.trim(), note: customer.note.trim() },
    );
    window.open(whatsappLink(whatsappNumber, message), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-14">
      <div>
        <ul className="divide-y divide-line border-y border-line">
          {items.map((item) => (
            <li key={item.key} className="flex gap-4 py-5">
              <Link href={`/produk/${item.slug}`} className="relative size-24 shrink-0 overflow-hidden bg-sand sm:size-28">
                {item.image && <Image src={item.image} alt="" fill sizes="112px" className="object-cover" />}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link href={`/produk/${item.slug}`} className="font-semibold leading-snug hover:text-fuji">
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-muted">
                  {[item.size && `Ukuran ${item.size}`, item.color && `Warna ${item.color}`].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-1 text-sm">{formatRupiah(item.price)}</p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                  <div className="inline-flex items-center border border-line bg-white">
                    <button
                      type="button"
                      aria-label={`Kurangi jumlah ${item.name}`}
                      disabled={item.quantity <= 1}
                      onClick={() => setQuantity(item.key, item.quantity - 1)}
                      className="flex size-11 items-center justify-center disabled:opacity-30"
                    >
                      <Minus aria-hidden className="size-4" />
                    </button>
                    <span className="w-9 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Tambah jumlah ${item.name}`}
                      disabled={item.quantity >= 99}
                      onClick={() => setQuantity(item.key, item.quantity + 1)}
                      className="flex size-11 items-center justify-center disabled:opacity-30"
                    >
                      <Plus aria-hidden className="size-4" />
                    </button>
                  </div>
                  <p className="font-semibold tabular-nums">{formatRupiah(item.price * item.quantity)}</p>
                  <button
                    type="button"
                    aria-label={`Hapus ${item.name} dari keranjang`}
                    onClick={() => removeItem(item.key)}
                    className="flex size-11 items-center justify-center text-muted hover:text-fuji"
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <button type="button" onClick={clear} className="mt-4 text-sm text-muted underline underline-offset-4 hover:text-fuji">
          Kosongkan keranjang
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="h-fit border border-line bg-white p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-3xl tracking-wide">Data pemesan</h2>
        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="cart-name" className="text-sm font-semibold">
              Nama
            </label>
            <input
              id="cart-name"
              autoComplete="name"
              value={customer.name}
              onChange={(event) => setCustomer({ ...customer, name: event.target.value })}
              className="input mt-1.5"
            />
          </div>
          <div>
            <label htmlFor="cart-address" className="text-sm font-semibold">
              Alamat pengiriman
            </label>
            <textarea
              id="cart-address"
              rows={3}
              autoComplete="street-address"
              value={customer.address}
              onChange={(event) => setCustomer({ ...customer, address: event.target.value })}
              className="input mt-1.5"
            />
          </div>
          <div>
            <label htmlFor="cart-note" className="text-sm font-semibold">
              Catatan <span className="font-normal text-muted">(opsional)</span>
            </label>
            <input
              id="cart-note"
              value={customer.note}
              onChange={(event) => setCustomer({ ...customer, note: event.target.value })}
              className="input mt-1.5"
            />
          </div>
        </div>

        <dl className="mt-6 border-t border-line pt-5">
          <div className="flex items-baseline justify-between">
            <dt className="text-sm text-muted">Subtotal</dt>
            <dd className="text-xl font-bold tabular-nums">{formatRupiah(subtotal)}</dd>
          </div>
        </dl>
        <p className="mt-1 text-xs text-muted">Belum termasuk ongkir. Total akhir dikonfirmasi admin.</p>

        {error && (
          <p role="alert" className="mt-4 text-sm font-medium text-fuji">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-whatsapp mt-5 min-h-12 w-full">
          <WhatsAppIcon /> Kirim pesanan via WhatsApp
        </button>
      </form>
    </div>
  );
}
