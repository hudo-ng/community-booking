"use server";
import { authOptions } from "@/auth.config";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { toSlug } from "@/lib/slug";
import z from "zod";
import { revalidatePath } from "next/cache";

const serviceSchema = z.object({
  title: z.string().min(3).max(50),
  description: z.string().max(1000).optional(),
  price: z.coerce.number().int().min(1).max(100000),
  defaultDurationMins: z.coerce
    .number()
    .int()
    .min(15)
    .max(8 * 60),
  imageUrl: z
    .url()
    .optional()
    .or(z.literal(""))
    .transform((v) => v || null),
});

interface ActionError {
  message: string;
  code?: string;
}

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (
    !session?.user ||
    !["PROVIDER", "ADMIN", "SUPERADMIN"].includes(session.user.role)
  )
    redirect("/login");

  return session.user;
}

export async function createService(fd: FormData): Promise<void> {
  const user = await requireSession();

  const parsed = serviceSchema.safeParse({
    title: fd.get("title"),
    description: fd.get("description") ?? undefined,
    price: fd.get("price"),
    defaultDurationMins: fd.get("defaultDurationMins"),
    imageUrl: fd.get("imageUrl") ?? undefined,
  });

  if (!parsed.success) {
    redirect(
      `/admin/services/new?m=${encodeURIComponent("Invalid form")}&t=error`
    );
  }

  const providerId = user.id;
  const base = toSlug(parsed.data.title);
  let slug = base,
    n = 1;
  while (true) {
    const exists = await prisma.service.findUnique({
      where: { providerId_slug: { slug, providerId } },
      select: { id: true },
    });
    if (!exists) break;
    slug = `${base}-${++n}`;
  }

  try {
    const newService = await prisma.service.create({
      data: {
        providerId,
        slug,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        price: parsed.data.price,
        imageUrl: parsed.data.imageUrl,
        defaultDurationMins: parsed.data.defaultDurationMins,
      },
      select: { id: true },
    });
    revalidatePath("/admin/services");
    redirect(
      `/admin/services/${newService.id}/edit?m=${encodeURIComponent(
        "Created"
      )}&t=success`
    );
  } catch (e) {
    const err = e as ActionError
    if (err.code === "P2002") {
      redirect(
        `/admin/services/new?m=${encodeURIComponent(
          "Slug taken, try again"
        )}&t=error`
      );
    }
    throw err;
  }
}

export async function updateService(fd: FormData) {
  const user = await requireSession();
  const id = String(fd.get("id") || "");
  if (!id)
    redirect(`/admin/services?m=${encodeURIComponent("Missing id")}&t=error`);

  const svc = await prisma.service.findUnique({
    where: { id },
    select: { providerId: true },
  });
  const providerId = user.id;
  if (!svc || svc.providerId !== providerId) {
    redirect(`/admin/services?m=${encodeURIComponent("Not found")}&t=error`);
  }

  const parsed = serviceSchema.partial().safeParse({
    title: fd.get("title") ?? undefined,
    description: fd.get("description") ?? undefined,
    price: fd.get("price") ?? undefined,
    defaultDurationMins: fd.get("defaultDurationMins") ?? undefined,
    imageUrl: fd.get("imageUrl") ?? undefined,
  });
  if (!parsed.success) {
    redirect(
      `/admin/services/${id}/edit?m=${encodeURIComponent(
        "Invalid form"
      )}&t=error`
    );
  }

  await prisma.service.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath(`/admin/services/${id}/edit`);
  redirect(
    `/admin/services/${id}/edit?m=${encodeURIComponent("Saved")}&t=success`
  );
}

export async function deleteService(fd: FormData) {
  const user = await requireSession();
  const id = String(fd.get("id") || "");
  if (!id)
    redirect(`/admin/services?m=${encodeURIComponent("Missing id")}&t=error`);

  const svc = await prisma.service.findUnique({
    where: { id },
    select: { providerId: true },
  });
  const providerId = user.id;
  if (!svc || svc.providerId !== providerId) {
    redirect(`/admin/services?m=${encodeURIComponent("Not found")}&t=error`);
  }

  await prisma.service.delete({ where: { id } });
  revalidatePath("/admin/services");
  redirect(`/admin/services?m=${encodeURIComponent("Deleted")}&t=success`);
}
