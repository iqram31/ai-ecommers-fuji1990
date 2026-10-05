import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/forms";
import { PageHeader } from "@/components/admin/ui";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Pengaturan" };

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <>
      <PageHeader title="Pengaturan" description="Nomor WhatsApp, identitas toko, dan cerita brand." />
      <SettingsForm settings={settings} />
    </>
  );
}
