// Mengisi database dengan data awal toko. Aman dijalankan berulang kali:
// data yang sudah ada (berdasarkan slug) tidak ditimpa.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { seedBanners, seedCategories, seedPages, seedProducts, seedSettings } from "../src/lib/seed-data";

const prisma = new PrismaClient();

async function main() {
  await prisma.siteSetting.upsert({ where: { id: 1 }, update: {}, create: { id: 1, ...seedSettings } });

  for (const category of seedCategories) {
    await prisma.category.upsert({ where: { slug: category.slug }, update: {}, create: category });
  }

  for (const { categorySlug, images, ...product } of seedProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product,
        category: { connect: { slug: categorySlug } },
        images: { create: images.map((image, index) => ({ ...image, sortOrder: index })) },
      },
    });
  }

  if ((await prisma.banner.count()) === 0) {
    await prisma.banner.createMany({ data: seedBanners });
  }

  for (const page of seedPages) {
    await prisma.page.upsert({ where: { slug: page.slug }, update: {}, create: page });
  }

  console.log("Seed selesai.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
