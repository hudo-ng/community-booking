"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { parseHM, providerLocalToUTC, isValidHm } from "@/lib/time";

async function requireProviderSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "PROVIDER") redirect("/login");
  return session.user;
}

export async function createRule(fd: FormData): Promise<void> {
  const user = await requireProviderSession();
  const weekday = Number(fd.get("weekday") ?? NaN);
  const startLocalRaw = String(fd.get("startLocal") ?? "");
  const endLocalRaw = String(fd.get("endLocal") ?? "");
  const slotMins = Number(fd.get("slotMins") ?? 60);

  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) return;
  if (!isValidHm(startLocalRaw) || !isValidHm(endLocalRaw)) return;

  const { hh: sh, mm: sm } = parseHM(startLocalRaw);
  const { hh: eh, mm: em } = parseHM(endLocalRaw);
  const pad = (n: number) => String(n).padStart(2, "0");
  const startLocal = `${pad(sh)}:${pad(sm)}`;
  const endLocal = `${pad(eh)}:${pad(em)}`;

  const toMin = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  const fromMin = (mins: number) =>
    `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(
      mins % 60
    ).padStart(2, "0")}`;

  const start = toMin(startLocal);
  const end = toMin(endLocal);
  if (end <= start) return;

  await prisma.$transaction(async (tx) => {
    const sameDay = await tx.availabilityRules.findMany({
      where: { providerId: user.id, weekday },
    });

    const overlaps = sameDay.filter((r) => {
      const rs = toMin(r.startLocal);
      const re = toMin(r.endLocal);
      return start <= re && end >= rs;
    });

    if (overlaps.length === 0) {
      await tx.availabilityRules.create({
        data: { providerId: user.id, weekday, startLocal, endLocal, slotMins },
      });
      revalidatePath("/admin/availability");
      return;
    }

    const mergedStart = Math.min(
      start,
      ...overlaps.map((r) => toMin(r.startLocal))
    );
    const mergedEnd = Math.max(end, ...overlaps.map((r) => toMin(r.endLocal)));
    const mergedSlotMins = Math.min(
      slotMins,
      ...overlaps.map((r) => r.slotMins)
    );

    await tx.availabilityRules.deleteMany({
      where: { id: { in: overlaps.map((r) => r.id) } },
    });

    await tx.availabilityRules.create({
      data: {
        providerId: user.id,
        weekday,
        startLocal: fromMin(mergedStart),
        endLocal: fromMin(mergedEnd),
        slotMins: mergedSlotMins,
      },
    });
    revalidatePath("/admin/availability");
  });
}

export async function deleteRule(fd: FormData): Promise<void> {
  const user = await requireProviderSession();
  const id = String(fd.get("id") ?? "");
  if (!id) return;

  const row = await prisma.availabilityRules.findUnique({ where: { id } });
  if (!row || row.providerId !== user.id) return;

  await prisma.availabilityRules.delete({ where: { id } });
  revalidatePath("/admin/availability");
}

export async function addTimeOff(fd: FormData): Promise<void> {
  const user = await requireProviderSession();
  const date = String(fd.get("date") ?? "");
  const startHm = String(fd.get("start") ?? "");
  const endHm = String(fd.get("end") ?? "");
  const reason = String(fd.get("reason") ?? "");
  const provider = await prisma.user.findUnique({ where: { UserId: user.id } });
  const tz = provider?.timezone ?? "America/Edmonton";

  if (!date || !isValidHm(startHm) || !isValidHm(endHm)) return;
  const startUtc = providerLocalToUTC(date, startHm, tz);
  const endUtc = providerLocalToUTC(date, endHm, tz);
  if (endUtc <= startUtc) return;

  await prisma.timeOff.create({
    data: {
      providerId: user.id,
      startTimeUtc: startUtc,
      endTimeUtc: endUtc,
      reason,
    },
  });
  revalidatePath("/admin/availability");
}

export async function deleteTimeOff(fd: FormData): Promise<void> {
  const user = await requireProviderSession();
  const id = String(fd.get("id") ?? "");
  if (!id || id !== user.id) return;

  const row = await prisma.timeOff.findUnique({ where: { id } });
  if (!row || row.providerId !== user.id) return;

  await prisma.timeOff.delete({ where: { id } });
  revalidatePath("/admin/availability");
}

export async function updateService(fd: FormData): Promise<void> {
  const user = await requireProviderSession();
  const id = String(fd.get("id") ?? "");
  const title = String(fd.get("title") ?? "");
  const price = Number(fd.get("price") ?? NaN);
  const duration = Number(fd.get("defaultDurationMins") ?? NaN);

  if (!id) return;
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service || service.providerId !== user.id) return;

  await prisma.service.update({
    where: { id },
    data: {
      ...(title ? { title } : {}),
      ...(Number.isFinite(price) ? { price } : {}),
      ...(Number.isFinite(duration)
        ? { defaultDurationMins: Math.max(15, Math.min(8 * 60, duration)) }
        : {}),
    },
  });
  revalidatePath("/admin/availability");
}
