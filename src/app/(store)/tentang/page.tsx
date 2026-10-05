import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return { title: "Tentang Kami", description: settings.description, alternates: { canonical: "/tentang" } };
}

export default async function AboutPage() {
  const settings = await getSettings();
  const paragraphs = settings.aboutBody.split(/\n+/).filter((line) => line.trim());

  return (
    <>
      <div className="relative h-56 bg-ink sm:h-80">
        <Image src="/banners/detroit-canvas.webp" alt="" fill priority sizes="100vw" className="object-cover opacity-60" />
      </div>
      <div className="container-page grid gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <div className="h-fit bg-white p-6">
          <Image
            src="/brand/logo.jpg"
            alt={`Logo ${settings.storeName}`}
            width={1080}
            height={1080}
            sizes="(min-width: 1024px) 35vw, 100vw"
            className="h-auto w-full"
          />
        </div>
        <div>
          <p className="eyebrow">Tentang kami</p>
          <h1 className="heading mt-2 text-5xl sm:text-6xl">{settings.aboutTitle}</h1>
          <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-ink/80">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/produk" className="btn btn-primary">
              Lihat koleksi
            </Link>
            <Link href="/kontak" className="btn btn-outline">
              Hubungi kami
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
