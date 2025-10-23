import { prisma } from "@/lib/db";

export async function generateUniqueProviderSlug(name: string): Promise<string> {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0,3);

  let slug = "";
  let isUnique = false;

  while (!isUnique) {
    const suffix = Math.random().toString(36).substring(2, 6);
    slug = `${base}-${suffix}`;

    const existing = await prisma.user.findUnique({
      where: { slug },
      select: { UserId: true },
    });

    if (!existing) isUnique = true;
  }

  return slug;
}
