import { PrismaClient } from "@prisma/client";
import { mockProducts } from "@/lib/mock-data"; // adjust path if needed

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Ensure categories exist first
  const categories = await Promise.all(
    Array.from(new Set(mockProducts.map((p) => p.category.name))).map(
      async (catName) =>
        prisma.category.upsert({
          where: { slug: catName.toLowerCase().replace(/\s+/g, "-") },
          update: {},
          create: {
            name: catName,
            slug: catName.toLowerCase().replace(/\s+/g, "-"),
          },
        })
    )
  );

  // Seed products
  for (const product of mockProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        stock: product.stock,
        featured: product.featured,
        slug: product.slug,
        productSellerId: '',
        category: {
          connect: { slug: product.category.slug },
        },
      },
    });
  }

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
