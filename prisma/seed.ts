import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import path from "node:path";

const db = new PrismaClient();

config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  const superAd = process.env.SUPER_ADMIN_EMAIL!;
  const superAdPass = process.env.SUPER_ADMIN_PASS!;

  if (!superAd || !superAdPass)
    throw new Error("Error from super admin credentials");

  await db.user.upsert({
    where: { email: superAd },
    update: {},
    create: {
      email: superAd,
      name: "Super Admin",
      role: "SUPERADMIN",
      slug: "super-admin",
      passwordHash: await bcrypt.hash(superAdPass, 12),
    },
  });

  const alice = await db.user.upsert({
    where: { email: "alice@demo.dev" },
    update: {},
    create: {
      email: "alice@demo.dev",
      name: "Alice Barber",
      role: "PROVIDER",
      slug: "alice-barber",
      passwordHash: await bcrypt.hash("alice12345@", 10),
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

  const workDays = [1, 2, 3, 4, 5, 6];
  await db.availabilityRules.createMany({
    data: workDays.map((wd) => ({
      providerId: alice.UserId,
      startLocal: "08:00",
      endLocal: "18:00",
      weekday: wd,
      slotMins: 60,
    })),
  });
}

main()
  .then(() => console.log("seeded"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => db.$disconnect());
