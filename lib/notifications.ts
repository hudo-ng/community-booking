import { prisma } from "./db";
import { randomBytes } from "crypto";

export async function ensureManageToken(bookingId: string) {
  const b = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { manageToken: true },
  });
  if (b?.manageToken) return b.manageToken;

  const token = randomBytes(16).toString("hex");
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      manageToken: token,
    },
  });
  return token;
}

export async function enquequeBookingNotifications(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: {
        include: {
          provider: {
            select: {
              name: true,
              timezone: true,
              UserId: true,
            },
          },
        },
      },
    },
  });

  if (!booking) return;

  const start = booking.startAt;
  const end =
    booking.endAt ??
    new Date(
      start.getTime() + (booking.service.defaultDurationMins ?? 60) * 60000
    );
  const now = new Date();

  const token = await ensureManageToken(booking.id);
  const toEmail = booking.customerEmail;

  const t24 = new Date(start.getTime() - 24 * 60 * 60 * 1000);
  const t02 = new Date(start.getTime() - 2 * 60 * 60 * 1000);

  async function upsert(
    kind: "BOOKING_CONFIRMATION" | "REMINDER_24H" | "REMINDER_2H",
    runAt: Date
  ) {
    await prisma.notification.upsert({
      where: {
        bookingId_channel_kind: {
          bookingId: bookingId,
          channel: "EMAIL",
          kind,
        },
      },
      update: { runAt },
      create: {
        bookingId: bookingId,
        channel: "EMAIL",
        kind,
        to: toEmail,
        runAt,
      },
    });
  }

  await upsert("BOOKING_CONFIRMATION", now);
  await upsert("REMINDER_24H", t24);
  await upsert("REMINDER_2H", t02);

  return {
    manageUrl: `${process.env.APP_URL}/booking/${booking.id}/manage?t=${token}`,
    start,
    end,
  };
}
