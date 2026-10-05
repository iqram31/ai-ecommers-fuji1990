import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RichText } from "@/components/store/rich-text";
import { getPageBySlug, getPublishedPages } from "@/lib/data";

export async function generateStaticParams() {
  const pages = await getPublishedPages();
  return pages.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/info/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return {};
  return { title: page.title, alternates: { canonical: `/info/${page.slug}` } };
}

export default async function InfoPage({ params }: PageProps<"/info/[slug]">) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) notFound();

  return (
    <article className="container-page max-w-3xl py-10 sm:py-16">
      <p className="eyebrow">Informasi</p>
      <h1 className="heading mt-2">{page.title}</h1>
      <RichText content={page.content} className="mt-8" />
    </article>
  );
}
