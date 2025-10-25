import { prisma } from "./db";
import {
  addMinutes,
  isBefore,
  isAfter,
  max as maxDate,
  min as minDate,
} from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

type slotParams = {
  providerId: string;
  serviceId: string;
  providerTz: string;
  date: string;
  durationMins: number;
  leadMinutes: number;
};

export async function generateSlots(p: slotParams) {
  const lead = p.leadMinutes ?? 60;

  const dateLocal = fromZonedTime(`${p.date}T00:00:00`, p.providerTz);
  const weekday = toZonedTime(dateLocal, p.providerTz).getDay();

  const rules = await prisma.availabilityRules.findMany({
    where: {
      providerId: p.providerId,
      weekday,
    },
  });

  if (rules.length === 0) return [];

  const windowsUtc = rules.map((rule) => {
    const startUtc = fromZonedTime(
      `${p.date}T${rule.startLocal}`,
      p.providerTz
    );
    const endUtc = fromZonedTime(`${p.date}T${rule.endLocal}`, p.providerTz);
    return { startUtc, endUtc, slotMins: rule.slotMins };
  });

  if (windowsUtc.length === 0) {
    return [];
  }

  const dayStartUtc = minDate(windowsUtc.map((w) => w.startUtc));
  const dayEndUtc = maxDate(windowsUtc.map((w) => w.endUtc));

  const [bookings, timeOff] = await Promise.all([
    prisma.booking.findMany({
      where: {
        serviceId: p.serviceId,
        status: { in: ["PENDING", "CONFIRMED"] },
        startAt: { lt: dayEndUtc },
        endAt: { gt: dayStartUtc },
      },
      select: { startAt: true, endAt: true },
    }),
    prisma.timeOff.findMany({
      where: {
        providerId: p.providerId,
        startTimeUtc: { lt: dayEndUtc },
        endTimeUtc: { gt: dayStartUtc },
      },
      select: { startTimeUtc: true, endTimeUtc: true },
    }),
  ]);

  const bookingBlocks = bookings.map((b) => ({
    start: b.startAt,
    end: b.endAt ?? new Date(b.startAt.getTime() + p.durationMins * 60_000),
  }));

  const timeOffBlocks = timeOff.map((t) => ({
    start: t.startTimeUtc,
    end: t.endTimeUtc,
  }));

  const blocks: Array<{ start: Date; end: Date }> = [
    ...bookingBlocks,
    ...timeOffBlocks,
  ];

  const now = new Date();

  const earliestStart = addMinutes(now, lead);

  const slotsUtc: string[] = [];

  for (const w of windowsUtc) {
    const slotStep = w.slotMins;
    for (let t = new Date(w.startUtc); ; t = addMinutes(t, slotStep)) {
      const slotStart = t;
      const slotEnd = addMinutes(slotStart, p.durationMins);

      if (!isBefore(slotStart, w.endUtc)) break;
      if (isAfter(slotEnd, w.endUtc)) break;

      if (isBefore(slotStart, earliestStart)) continue;

      const conflicts = blocks.some(
        ({ start, end }) => slotStart < end && slotEnd > start
      );
      if (conflicts) continue;

      slotsUtc.push(slotStart.toISOString());
    }
  }

  return slotsUtc.sort();
}

export function formatSlotLabel(isoUtc: string, providerTz: string) {
  const d = toZonedTime(new Date(isoUtc), providerTz);
  return d.toLocaleString("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
