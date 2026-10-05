import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Cormorant_Garamond, Inter } from "next/font/google";
import { getSettings } from "@/lib/data";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const bebas = Bebas_Neue({ variable: "--font-bebas", subsets: ["latin"], weight: "400", display: "swap" });
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = `${settings.storeName} — Clothing dari Bandung`;
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: title, template: `%s | ${settings.storeName}` },
    description: settings.description,
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: settings.storeName,
      title,
      description: settings.description,
      images: [{ url: "/banners/puffer-precision.webp", width: 2000, height: 1000 }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = { themeColor: "#141414" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${inter.variable} ${bebas.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
