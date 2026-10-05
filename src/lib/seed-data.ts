// Data awal toko. Dipakai oleh `prisma/seed.ts` dan sebagai katalog contoh
// ketika DATABASE_URL belum diatur (mode demo).

export const seedSettings = {
  storeName: "FUJI 1995",
  tagline: "Beauty of imperfection",
  description:
    "FUJI 1995 adalah brand clothing asal Bandung. Jaket, celana, dan kaos dengan sentuhan Jepang, dibuat untuk dipakai setiap hari.",
  whatsappNumber: "6285212341684",
  email: null as string | null,
  address: "Bandung, Jawa Barat, Indonesia",
  openHours: "Senin – Sabtu, 09.00 – 17.00 WIB",
  instagramUrl: null as string | null,
  tiktokUrl: null as string | null,
  shopeeUrl: "https://shopee.co.id/fuji1995_",
  announcement: "Order langsung via WhatsApp — dikirim dari Bandung ke seluruh Indonesia",
  aboutTitle: "Ensō — beauty of imperfection",
  aboutBody: [
    "FUJI 1995 lahir di Bandung dari kecintaan pada workwear, outdoor, dan estetika Jepang. Nama kami diambil dari Gunung Fuji: tenang, kokoh, dan selalu jadi penunjuk arah.",
    "Kami percaya pakaian yang baik tidak harus sempurna — ia harus jujur. Ensō, lingkaran kuas yang digambar dalam satu tarikan, mengingatkan kami bahwa keindahan justru ada pada ketidaksempurnaan.",
    "Setiap jaket, celana, dan kaos kami dijahit oleh penjahit lokal Bandung dengan material pilihan, supaya nyaman dipakai harian dan makin berkarakter seiring waktu.",
  ].join("\n\n"),
};

export const seedCategories = [
  {
    name: "Jaket",
    slug: "jaket",
    description: "Puffer, detroit, dan windbreaker untuk riding dan harian.",
    imageUrl: "/products/columbia-puffer-olive-jacket/1.webp",
    sortOrder: 1,
  },
  {
    name: "Celana",
    slug: "celana",
    description: "Denim selvedge dan celana cargo.",
    imageUrl: "/products/distin-denim-black-indigo-pants/1.webp",
    sortOrder: 2,
  },
  {
    name: "Baju",
    slug: "baju",
    description: "Kaos oversize katun combed.",
    imageUrl: "/products/sunshine-black-oversize-tshirt/2.webp",
    sortOrder: 3,
  },
];

export const seedProducts = [
  {
    name: "Columbia Puffer Olive Jacket",
    slug: "columbia-puffer-olive-jacket",
    categorySlug: "jaket",
    description: [
      "Jaket puffer warna olive dengan kerah corduroy cokelat. Hangat untuk touring dan riding malam, tetap ringan untuk dipakai harian.",
      "## Detail",
      "- Model puffer (gelembung) dengan jahitan quilting horizontal",
      "- Kerah corduroy kontras",
      "- Kancing snap di bagian depan",
      "- Dua saku dada berpenutup dan dua saku samping",
      "- Tali serut di bagian bawah, manset karet di lengan",
      "- Patch rising sun di lengan dan label woven FUJI di bagian depan",
      "## Perawatan",
      "Cuci dengan air dingin, jangan gunakan pemutih, dan jemur di tempat teduh.",
    ].join("\n"),
    price: 389000,
    compareAtPrice: null as number | null,
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Olive"],
    material: null as string | null,
    isFeatured: true,
    videoUrl: "/products/columbia-puffer-olive-jacket/video.mp4",
    marketplaceUrl: "https://shopee.co.id/fuji1995_",
    images: [
      { url: "/products/columbia-puffer-olive-jacket/1.webp", alt: "Columbia Puffer Olive Jacket tampak depan" },
      { url: "/products/columbia-puffer-olive-jacket/2.webp", alt: "Columbia Puffer Olive Jacket dipakai model" },
      { url: "/products/columbia-puffer-olive-jacket/3.webp", alt: "Columbia Puffer Olive Jacket tampak belakang" },
      { url: "/products/columbia-puffer-olive-jacket/4.webp", alt: "Detail kerah corduroy dan label FUJI" },
    ],
  },
  {
    name: "Distin Denim Black Indigo Pants",
    slug: "distin-denim-black-indigo-pants",
    categorySlug: "celana",
    description: [
      "Kolaborasi FUJI 1995 × Distin Denim. Celana denim black indigo dengan aksen selvedge yang terlihat saat ujung celana dilipat.",
      "## Detail",
      "- Denim black indigo dengan benang jahit kontras",
      "- Aksen selvedge merah-putih di bagian dalam kaki",
      "- Patch kulit di pinggang belakang",
      "- Bordir matahari merah di saku belakang",
      "- Lima saku klasik",
      "## Perawatan",
      "Cuci terpisah pada pencucian pertama, balik celana sebelum dicuci, dan hindari mesin pengering.",
    ].join("\n"),
    price: 449000,
    compareAtPrice: null as number | null,
    sizes: ["28", "29", "30", "31", "32", "33", "34", "36"],
    colors: ["Black Indigo"],
    material: "Denim selvedge accent" as string | null,
    isFeatured: true,
    videoUrl: "/products/distin-denim-black-indigo-pants/video.mp4",
    marketplaceUrl: "https://shopee.co.id/fuji1995_",
    images: [
      { url: "/products/distin-denim-black-indigo-pants/1.webp", alt: "Distin Denim Black Indigo Pants tampak depan" },
      { url: "/products/distin-denim-black-indigo-pants/2.webp", alt: "Distin Denim Black Indigo Pants dipakai model" },
      { url: "/products/distin-denim-black-indigo-pants/3.webp", alt: "Detail patch kulit dan bordir saku belakang" },
      { url: "/products/distin-denim-black-indigo-pants/4.webp", alt: "Detail aksen selvedge" },
      { url: "/products/distin-denim-black-indigo-pants/5.webp", alt: "Distin Denim Black Indigo Pants tampak belakang" },
    ],
  },
  {
    name: "Sunshine Black Oversize T-Shirt",
    slug: "sunshine-black-oversize-tshirt",
    categorySlug: "baju",
    description: [
      "Kaos oversize hitam dengan grafis \"There Is Always Sunshine Tomorrow\" di dada kiri dan punggung.",
      "## Detail",
      "- Potongan oversize",
      "- Katun combed 20s yang tebal dan adem",
      "- Sablon kuning di dada kiri dan punggung",
      "- Label woven FUJI di kerah",
      "## Perawatan",
      "Cuci dengan posisi terbalik dan jangan setrika langsung di atas sablon.",
    ].join("\n"),
    price: 139000,
    compareAtPrice: null as number | null,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
    material: "Katun combed 20s" as string | null,
    isFeatured: true,
    videoUrl: null as string | null,
    marketplaceUrl: "https://shopee.co.id/fuji1995_",
    images: [
      { url: "/products/sunshine-black-oversize-tshirt/1.webp", alt: "Sunshine Black Oversize T-Shirt dipakai model" },
      { url: "/products/sunshine-black-oversize-tshirt/2.webp", alt: "Sunshine Black Oversize T-Shirt tampak depan" },
      { url: "/products/sunshine-black-oversize-tshirt/3.webp", alt: "Sablon punggung Sunshine" },
      { url: "/products/sunshine-black-oversize-tshirt/4.webp", alt: "Detail sablon dada dan label kerah" },
    ],
  },
];

export const seedBanners = [
  { title: "Unleash warmth, embrace style — Columbia Puffer Jacket", imageUrl: "/banners/puffer-precision.webp", linkUrl: "/produk/columbia-puffer-olive-jacket", sortOrder: 1 },
  { title: "Zipper up, stand out — Detroit jacket", imageUrl: "/banners/detroit-canvas.webp", linkUrl: "/produk?kategori=jaket", sortOrder: 2 },
  { title: "Bold choices, limitless materials — T-shirts & pants", imageUrl: "/banners/tshirts-pants.webp", linkUrl: "/produk", sortOrder: 3 },
  { title: "Discount up to 50% off", imageUrl: "/banners/discount-50.webp", linkUrl: "/produk", sortOrder: 4 },
];

export const seedPages = [
  {
    title: "Cara Order",
    slug: "cara-order",
    content: [
      "Semua pesanan diproses langsung oleh admin kami melalui WhatsApp.",
      "## Langkah pemesanan",
      "- Pilih produk, ukuran, dan jumlah, lalu tekan **Tambah ke keranjang** atau **Pesan via WhatsApp**.",
      "- Buka keranjang, isi nama dan alamat pengiriman, lalu tekan **Kirim pesanan via WhatsApp**.",
      "- Admin akan mengonfirmasi ketersediaan stok, ongkos kirim, dan total pembayaran.",
      "- Lakukan pembayaran sesuai instruksi admin, lalu kirim bukti transfer.",
      "- Pesanan dikemas dan dikirim dari Bandung. Nomor resi dikirim lewat WhatsApp.",
    ].join("\n"),
  },
  {
    title: "Panduan Ukuran",
    slug: "panduan-ukuran",
    content: [
      "Ukuran tiap produk bisa sedikit berbeda. Kalau ragu, kirim tinggi dan berat badan kamu ke admin lewat WhatsApp — kami bantu pilihkan ukuran yang pas.",
      "## Tips memilih ukuran",
      "- Ukur pakaian yang biasa kamu pakai, lalu bandingkan dengan size chart dari admin.",
      "- Kaos oversize memiliki potongan lebih longgar dari kaos reguler.",
      "- Untuk celana denim, pilih berdasarkan lingkar pinggang.",
    ].join("\n"),
  },
  {
    title: "Pengiriman & Penukaran",
    slug: "pengiriman-penukaran",
    content: [
      "## Pengiriman",
      "Pesanan dikirim dari Bandung ke seluruh Indonesia. Ongkos kirim dan pilihan ekspedisi dikonfirmasi admin saat pemesanan.",
      "## Penukaran ukuran",
      "Hubungi admin lewat WhatsApp untuk syarat dan cara penukaran ukuran. Simpan label dan kemasan produk sampai ukuran dipastikan pas.",
    ].join("\n"),
  },
];
