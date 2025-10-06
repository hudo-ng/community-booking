"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../lib/db";
import { enquequeBookingNotifications } from "@/lib/notifications";
import z from "zod";

export type BookingState = {
  ok: boolean;
  fieldErrors?: {
    startAt?: string[];
    durationMins?: string[];
    customerName?: string[];
    customerEmail?: string[];
    notes?: string[];
  };
  message?: string | undefined;
};

const BookingSchema = z.object({
  serviceId: z.string().min(1),
  providerId: z.string().min(1),
  slug: z.string().min(1),
  providerSlug: z.string().min(1),
  customerName: z.string().min(2, "Please enter your full name").max(80),
  customerEmail: z.email("Enter a valid email"),
  customerPhone: z.string().max(30).optional(),
  notes: z.string().max(500).optional(),
  startLocal: z.string().min(1, "Pick a date and time"),
  tzOffset: z.coerce.number().int(),
  durationMins: z.coerce
    .number()
    .int()
    .min(15)
    .max(8 * 60),
});

function toUtcFromLocal(local: string, tzOffsetMins: number): Date {
  const [datePart, timePart] = local.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  const localMs = Date.UTC(y, m - 1, d, hh, mm);
  const utcMs = localMs + tzOffsetMins * 60000;
  return new Date(utcMs);
}

export default async function createBooking(
  _prev: BookingState,
  formData: FormData
): Promise<BookingState> {
  const raw = {
    serviceId: String(formData.get("serviceId") ?? ""),
    providerId: String(formData.get("providerId") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    providerSlug: String(formData.get("providerSlug") ?? ""),
    customerName: String(formData.get("customerName") ?? ""),
    customerEmail: String(formData.get("customerEmail") ?? ""),
    customerPhone: formData.get("customerPhone")
      ? String(formData.get("customerPhone"))
      : undefined,
    notes: formData.get("notes") ? String(formData.get("notes")) : undefined,
    startLocal: String(formData.get("startAt") ?? ""),
    tzOffset: Number(formData.get("tzOffset") ?? 0),
    durationMins: Number(formData.get("durationMins") ?? 60),
  };

  const parsed = BookingSchema.safeParse(raw);

  if (!parsed.success) {
    const fmt = z.flattenError(parsed.error);
    return {
      ok: false,
      fieldErrors: fmt.fieldErrors,
    };
  }

  const {
    serviceId,
    providerSlug,
    slug,
    customerName,
    customerEmail,
    customerPhone,
    notes,
    startLocal,
    tzOffset,
    durationMins,
  } = parsed.data;
  const startAt = toUtcFromLocal(startLocal, tzOffset);
  const endAt = new Date(startAt.getTime() + durationMins * 60000);

  const now = new Date();

  if (startAt < now)
    return {
      ok: false,
      fieldErrors: {
        startAt: ["Cannot choose past time"],
      },
    };
  const maxAhead = new Date(now.getTime() + 90 * 24 * 60 * 60_000);
  if (startAt > maxAhead) {
    return {
      ok: false,
      fieldErrors: { startAt: ["Bookings allowed up to 90 days ahead"] },
    };
  }

  const conflicting = await prisma.booking.findFirst({
    where: {
      serviceId,
      status: { in: ["PENDING", "CONFIRMED"] },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
    select: { id: true },
  });

  if (conflicting) {
    return {
      ok: false,
      message: "That time is already taken",
    };
  }

  const newBooking = await prisma.booking.create({
    data: {
      serviceId,
      startAt,
      endAt,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      status: "PENDING",
    },
  });

  await enquequeBookingNotifications(newBooking.id);

  revalidatePath(`/providers/${providerSlug}/services/${slug}`);
  return { ok: true, message: "Request sent! We’ll confirm by email shortly." };
}
