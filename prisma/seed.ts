import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const alice = await db.user.upsert({
    where: { email: "alice@demo.dev" },
    update: {},
    create: {
      email: "alice@demo.dev",
      name: "Alice Barber",
      role: "PROVIDER",
      slug: "alice-barber",
    },
  });

  await db.service.upsert({
    where: {
      providerId_slug: { providerId: alice.UserId, slug: "wommen-haircut" },
    },
    update: {},
    create: {
      title: "Women Haircut",
      slug: "women-haircut",
      description: "Professional cut and style",
      price: 50,
      imageUrl: "/haircut.jpg",
      providerId: alice.UserId,
    },
  });

  await db.service.upsert({
    where: {
      providerId_slug: { providerId: alice.UserId, slug: "home-cleanning" },
    },
    update: {},
    create: {
      title: "Home Cleanning",
      slug: "home-cleanning",
      description: "Two-hour of basic cleaning session",
      price: 100,
      imageUrl: "/cleaning.jpg",
      providerId: alice.UserId,
    },
  });
}

main()
  .then(() => console.log("seeded"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => db.$disconnect());
