import { formatRupiah } from "./utils";

/** Ubah nomor lokal (0852-xxxx) menjadi format internasional tanpa tanda (62852xxxx). */
export function normalizeWhatsapp(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

/** Tampilkan nomor untuk dibaca manusia: 0852-1234-1684. */
export function displayWhatsapp(input: string) {
  const digits = normalizeWhatsapp(input);
  const local = digits.startsWith("62") ? `0${digits.slice(2)}` : digits;
  return local.replace(/^(\d{4})(\d{4})(\d+)$/, "$1-$2-$3");
}

export function whatsappLink(number: string, message?: string) {
  const base = `https://wa.me/${normalizeWhatsapp(number)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export type OrderLine = {
  name: string;
  price: number;
  quantity: number;
  size?: string | null;
  color?: string | null;
  url?: string;
};

export type OrderCustomer = { name?: string; address?: string; note?: string };

export function buildOrderMessage(storeName: string, lines: OrderLine[], customer: OrderCustomer = {}) {
  const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const out: string[] = [`Halo ${storeName}, saya mau order:`, ""];

  lines.forEach((line, index) => {
    const variant = [line.size && `Ukuran ${line.size}`, line.color && `Warna ${line.color}`]
      .filter(Boolean)
      .join(", ");
    out.push(`${index + 1}. ${line.name}`);
    if (variant) out.push(`   ${variant}`);
    out.push(`   ${line.quantity} x ${formatRupiah(line.price)} = ${formatRupiah(line.price * line.quantity)}`);
    if (line.url) out.push(`   ${line.url}`);
  });

  out.push("", `Subtotal: ${formatRupiah(total)} (belum termasuk ongkir)`);

  if (customer.name || customer.address || customer.note) {
    out.push("");
    if (customer.name) out.push(`Nama: ${customer.name}`);
    if (customer.address) out.push(`Alamat: ${customer.address}`);
    if (customer.note) out.push(`Catatan: ${customer.note}`);
  }

  out.push("", "Mohon info ketersediaan stok dan total pembayarannya. Terima kasih.");
  return out.join("\n");
}
