import type { Metadata } from "next";
import { CartView } from "@/components/store/cart-view";

export const metadata: Metadata = {
  title: "Keranjang",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <p className="eyebrow">Pesanan</p>
      <h1 className="heading mt-2">Keranjang</h1>
      <CartView />
    </div>
  );
}
