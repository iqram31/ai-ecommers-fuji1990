import { WhatsAppIcon } from "@/components/store/brand";
import { Footer } from "@/components/store/footer";
import { Header } from "@/components/store/header";
import { StoreProvider } from "@/components/store/store-context";
import { getCategories, getFooterPages, getSettings } from "@/lib/data";
import { whatsappLink } from "@/lib/whatsapp";

// Halaman toko dirender statis lalu disegarkan berkala; perubahan dari admin
// langsung memicu revalidasi (lihat revalidateStore di admin/actions.ts).
export const revalidate = 300;

export default async function StoreLayout({ children }: LayoutProps<"/">) {
  const [settings, categories, pages] = await Promise.all([getSettings(), getCategories(), getFooterPages()]);

  return (
    <StoreProvider storeName={settings.storeName} whatsappNumber={settings.whatsappNumber}>
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Lewati ke konten
      </a>
      {settings.announcement && (
        <p className="bg-ink px-4 py-2 text-center text-xs font-medium tracking-wide text-paper">
          {settings.announcement}
        </p>
      )}
      <Header storeName={settings.storeName} categories={categories} />
      <main id="konten" className="flex-1">
        {children}
      </main>
      <Footer settings={settings} categories={categories} pages={pages} />
      <a
        href={whatsappLink(settings.whatsappNumber, `Halo ${settings.storeName}, saya mau tanya produk.`)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat WhatsApp"
        className="fixed bottom-4 right-4 z-30 flex size-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition-transform hover:scale-105"
      >
        <WhatsAppIcon className="size-7" />
      </a>
    </StoreProvider>
  );
}
