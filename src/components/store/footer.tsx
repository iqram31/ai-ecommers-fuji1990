import Link from "next/link";
import type { StoreCategory, StoreSettings } from "@/lib/data";
import { displayWhatsapp, whatsappLink } from "@/lib/whatsapp";
import { Logo, WhatsAppIcon } from "./brand";

type FooterProps = {
  settings: StoreSettings;
  categories: StoreCategory[];
  pages: { title: string; slug: string }[];
};

export function Footer({ settings, categories, pages }: FooterProps) {
  const socials = [
    { label: "Instagram", href: settings.instagramUrl },
    { label: "TikTok", href: settings.tiktokUrl },
    { label: "Shopee", href: settings.shopeeUrl },
  ].filter((item): item is { label: string; href: string } => Boolean(item.href));

  return (
    <footer className="mt-auto bg-ink text-paper">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo name={settings.storeName} />
          <p className="mt-3 font-serif text-lg italic text-paper/80">{settings.tagline}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-paper/60">{settings.description}</p>
        </div>

        <FooterColumn title="Belanja">
          <FooterLink href="/produk">Semua Produk</FooterLink>
          {categories.map((category) => (
            <FooterLink key={category.slug} href={`/produk?kategori=${category.slug}`}>
              {category.name}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Informasi">
          <FooterLink href="/tentang">Tentang Kami</FooterLink>
          <FooterLink href="/kontak">Kontak</FooterLink>
          {pages.map((page) => (
            <FooterLink key={page.slug} href={`/info/${page.slug}`}>
              {page.title}
            </FooterLink>
          ))}
        </FooterColumn>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/50">Order & Bantuan</h2>
          <a
            href={whatsappLink(settings.whatsappNumber, `Halo ${settings.storeName}, saya mau tanya produk.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-lg font-semibold hover:text-fuji"
          >
            <WhatsAppIcon />
            {displayWhatsapp(settings.whatsappNumber)}
          </a>
          {settings.openHours && <p className="mt-2 text-sm text-paper/60">{settings.openHours}</p>}
          {settings.address && <p className="mt-1 text-sm text-paper/60">{settings.address}</p>}
          {socials.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 hover:text-fuji"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="border-t border-paper/10">
        <p className="container-page py-5 text-xs text-paper/50">
          © {new Date().getFullYear()} {settings.storeName}. Dibuat di Bandung.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/50">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-sm">{children}</ul>
    </nav>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-paper/80 hover:text-fuji">
        {children}
      </Link>
    </li>
  );
}
