import type { Metadata } from "next";
import { Clock, Mail, MapPin } from "lucide-react";
import { WhatsAppIcon } from "@/components/store/brand";
import { getSettings } from "@/lib/data";
import { displayWhatsapp, whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Hubungi admin untuk order, konsultasi ukuran, dan pertanyaan seputar produk.",
  alternates: { canonical: "/kontak" },
};

export default async function ContactPage() {
  const settings = await getSettings();
  const socials = [
    { label: "Instagram", href: settings.instagramUrl },
    { label: "TikTok", href: settings.tiktokUrl },
    { label: "Shopee", href: settings.shopeeUrl },
  ].filter((item): item is { label: string; href: string } => Boolean(item.href));

  return (
    <div className="container-page py-10 sm:py-16">
      <p className="eyebrow">Kontak</p>
      <h1 className="heading mt-2">Hubungi kami</h1>
      <p className="mt-3 max-w-xl text-muted">
        Order, konsultasi ukuran, atau tanya stok — admin kami siap membantu lewat WhatsApp.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="bg-ink p-8 text-paper sm:p-10">
          <h2 className="font-display text-3xl tracking-wide">WhatsApp order</h2>
          <p className="mt-3 text-4xl font-bold tabular-nums sm:text-5xl">{displayWhatsapp(settings.whatsappNumber)}</p>
          <a
            href={whatsappLink(settings.whatsappNumber, `Halo ${settings.storeName}, saya mau order.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp mt-7 min-h-12"
          >
            <WhatsAppIcon /> Chat sekarang
          </a>
        </div>

        <dl className="space-y-6 border border-line bg-white p-8 sm:p-10">
          {settings.address && (
            <ContactRow icon={<MapPin aria-hidden className="size-5" />} label="Alamat">
              {settings.address}
            </ContactRow>
          )}
          {settings.openHours && (
            <ContactRow icon={<Clock aria-hidden className="size-5" />} label="Jam operasional">
              {settings.openHours}
            </ContactRow>
          )}
          {settings.email && (
            <ContactRow icon={<Mail aria-hidden className="size-5" />} label="Email">
              <a href={`mailto:${settings.email}`} className="underline underline-offset-4 hover:text-fuji">
                {settings.email}
              </a>
            </ContactRow>
          )}
          {socials.length > 0 && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Temukan kami</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                  >
                    {social.label}
                  </a>
                ))}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

function ContactRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="mt-0.5 text-fuji">{icon}</span>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{label}</dt>
        <dd className="mt-1">{children}</dd>
      </div>
    </div>
  );
}
