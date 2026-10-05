"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildOrderMessage, whatsappLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./brand";
import { useStore } from "./store-context";

type PurchaseProps = {
  product: {
    slug: string;
    name: string;
    price: number;
    image: string | null;
    sizes: string[];
    colors: string[];
    inStock: boolean;
  };
  productUrl: string;
};

export function ProductPurchase({ product, productUrl }: PurchaseProps) {
  const { storeName, whatsappNumber, addItem } = useStore();
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null);
  const [color, setColor] = useState<string | null>(product.colors.length === 1 ? product.colors[0] : null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const validate = () => {
    const missing = [
      product.sizes.length > 0 && !size && "ukuran",
      product.colors.length > 0 && !color && "warna",
    ].filter(Boolean);
    if (missing.length > 0) {
      setError(`Pilih ${missing.join(" dan ")} terlebih dahulu.`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleAdd = () => {
    if (!validate()) return;
    addItem({ slug: product.slug, name: product.name, price: product.price, image: product.image, size, color, quantity });
    setAdded(true);
  };

  const handleWhatsapp = () => {
    if (!validate()) return;
    const message = buildOrderMessage(storeName, [
      { name: product.name, price: product.price, quantity, size, color, url: productUrl },
    ]);
    window.open(whatsappLink(whatsappNumber, message), "_blank", "noopener,noreferrer");
  };

  if (!product.inStock) {
    return (
      <div className="space-y-3">
        <p className="border border-line bg-sand px-4 py-3 text-sm font-medium">
          Stok produk ini sedang habis. Tanyakan jadwal restock ke admin.
        </p>
        <a
          href={whatsappLink(whatsappNumber, `Halo ${storeName}, kapan ${product.name} restock?\n${productUrl}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-whatsapp w-full"
        >
          <WhatsAppIcon /> Tanya restock via WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {product.sizes.length > 0 && (
        <OptionGroup
          label="Ukuran"
          options={product.sizes}
          value={size}
          onChange={(value) => {
            setSize(value);
            setAdded(false);
            setError(null);
          }}
        />
      )}
      {product.colors.length > 0 && (
        <OptionGroup
          label="Warna"
          options={product.colors}
          value={color}
          onChange={(value) => {
            setColor(value);
            setAdded(false);
            setError(null);
          }}
        />
      )}

      <div>
        <p className="text-sm font-semibold">Jumlah</p>
        <div className="mt-2 inline-flex items-center border border-line bg-white">
          <button
            type="button"
            aria-label="Kurangi jumlah"
            disabled={quantity <= 1}
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="flex size-11 items-center justify-center disabled:opacity-30"
          >
            <Minus aria-hidden className="size-4" />
          </button>
          <span aria-live="polite" className="w-10 text-center text-sm font-semibold tabular-nums">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Tambah jumlah"
            disabled={quantity >= 99}
            onClick={() => setQuantity((value) => Math.min(99, value + 1))}
            className="flex size-11 items-center justify-center disabled:opacity-30"
          >
            <Plus aria-hidden className="size-4" />
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-fuji">
          {error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={handleWhatsapp} className="btn btn-whatsapp min-h-12">
          <WhatsAppIcon /> Pesan via WhatsApp
        </button>
        <button type="button" onClick={handleAdd} className="btn btn-outline min-h-12">
          <ShoppingBag aria-hidden className="size-4" /> Tambah ke keranjang
        </button>
      </div>

      <p role="status" className={cn("text-sm", added ? "flex items-center gap-2" : "sr-only")}>
        {added && (
          <>
            <Check aria-hidden className="size-4 text-whatsapp" />
            Masuk keranjang.
            <Link href="/keranjang" className="font-semibold underline underline-offset-4 hover:text-fuji">
              Lihat keranjang
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function OptionGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold">
        {label}
        {value && <span className="ml-2 font-normal text-muted">{value}</span>}
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={option === value}
            onClick={() => onChange(option)}
            className={cn(
              "min-h-11 min-w-11 border px-3 text-sm font-medium transition-colors",
              option === value ? "border-ink bg-ink text-paper" : "border-line bg-white hover:border-ink",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
