"use server";

import { prisma } from "@/lib/db";
import { providerLocalToUTC } from "@/lib/time";
import { enquequeBookingNotifications } from "@/lib/notifications";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function requireManageTokenContext(bookingId: string, token: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: {
        include: {
          provider: {
            select: {
              UserId: true,
              name: true,
              timezone: true,
            },
          },
        },
      },
    },
  });

  if (!booking || !booking.manageToken || booking.manageToken !== token)
    return null;

  return booking;
}

function withinCutoff(now: Date, startAt: Date, cutoffHours: number) {
  const cutoff = new Date(startAt.getTime() - cutoffHours * 60 * 60 * 1000);
  return now <= cutoff;
}

export async function cancelBooking(fd: FormData) {
  const id = String(fd.get("bookingId") || "");
  const token = String(fd.get("token") || "");
  const reason = String(fd.get("reason") || "");

  const booking = await requireManageTokenContext(id, token);

  if (!booking)
    redirect(
      `/bookings/${id}/manage?m=${encodeURIComponent(
        "Unauthorized"
      )}&t=error&token=${token}`
    );

  if (booking!.status === "CANCELLED") {
    redirect(
      `/booking/${id}/manage?m=${encodeURIComponent(
        "Already cancelled"
      )}&t=info`
    );
  }

  const now = new Date();
  const ok = withinCutoff(
    now,
    booking.startAt,
    booking.service.cancellationPolicyHours
  );
  if (!ok) {
    redirect(
      `/bookings/${id}/manage?m=${encodeURIComponent(
        `CancelNotAllowed(Must before: ${booking.service.cancellationPolicyHours}h)`
      )}&t=error`
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: now,
        cancellationReason: reason || null,
      },
    });

    await tx.notification.deleteMany({
      where: { bookingId: id, status: "PENDING" },
      // TODO: queque cancellation email
    });
  });

  revalidatePath(`/bookings/${id}/manage`);
  redirect(
    `/bookings/${id}/manage?m=${encodeURIComponent(
      "Booking cancelled"
    )}&t=success&token=${token}`
  );
}

export async function rescheduleBooking(fd: FormData) {
  const id = String(fd.get("bookingId") || "");
  const token = String(fd.get("token") || "");
  const newStartLocalYMD = String(fd.get("newStartLocalYMD") || "");
  const newStartLocalHHMM = String(fd.get("newStartLocalHHMM") || "");

  const b = await requireManageTokenContext(id, token);
  if (!b)
    redirect(
      `/bookings/${id}/manage?m=${encodeURIComponent("Unauthorized")}&t=error`
    );

  if (b!.status === "CANCELLED") {
    redirect(
      `/bookings/${id}/manage?m=${encodeURIComponent(
        "Cannot reschedule a cancelled booking"
      )}&t=error&token=${token}`
    );
  }

  const now = new Date();
  const ok = withinCutoff(now, b.startAt, b.service.cancellationPolicyHours);
  if (!ok) {
    redirect(
      `/bookings/${id}/manage?m=${encodeURIComponent(
        `ResheduleNotAllowed(Must before: ${b.service.cancellationPolicyHours}h)`
      )}&t=error&token=${token}`
    );
  }

  const tz = b!.service.provider.timezone || "America/Edmonton";
  let startAt: Date;
  try {
    startAt = providerLocalToUTC(newStartLocalYMD, newStartLocalHHMM, tz);
  } catch {
    redirect(
      `/booking/${id}/manage?m=${encodeURIComponent(
        "Invalid date/time"
      )}&t=error&token=${token}`
    );
  }

  if (startAt.getTime() < now.getTime() + 5 * 60000) {
    redirect(
      `/booking/${id}/manage?m=${encodeURIComponent(
        "Pick a future time"
      )}&t=error&token=${token}`
    );
  }

  const durMins = b!.service.defaultDurationMins ?? 60;
  const endAt = new Date(startAt.getTime() + durMins * 60000);

  const [conflictingBooking, timeOff] = await Promise.all([
    prisma.booking.findFirst({
      where: {
        id: { not: b!.id },
        serviceId: b!.serviceId,
        status: { in: ["PENDING", "CONFIRMED"] },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
      select: { id: true },
    }),
    prisma.timeOff.findFirst({
      where: {
        providerId: b!.service.provider.UserId,
        startTimeUtc: { lt: endAt },
        endTimeUtc: { gt: startAt },
      },
      select: { id: true },
    }),
  ]);

  if (conflictingBooking) {
    redirect(
      `/bookings/${id}/manage?m=${encodeURIComponent(
        "That time is already booked"
      )}&t=error&token=${token}`
    );
  }
  if (timeOff) {
    redirect(
      `/bookings/${id}/manage?m=${encodeURIComponent(
        "Provider is unavailable"
      )}&t=error&token=${token}`
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({ where: { id: b!.id }, data: { startAt, endAt } });
    await tx.notification.deleteMany({
      where: { bookingId: b!.id, status: "PENDING" },
    });
  });
  await enquequeBookingNotifications(b!.id);

  revalidatePath(`/bookings/${id}/manage`);
  redirect(
    `/bookings/${id}/manage?m=${encodeURIComponent(
      "Rescheduled"
    )}&t=success&token=${token}`
  );
}
