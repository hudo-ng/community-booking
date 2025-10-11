import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/mailer";
import { buildBookingIcs } from "@/lib/ics";
import { lte } from "zod";

function formatInTz(d: Date, tz: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).format(d);
}

function formatRangeInTz(start: Date, end: Date, tz: string) {
  const d = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  const t = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });

  const sameDay =
    d.formatToParts(start).find((p) => p.type === "day")?.value ===
      d.formatToParts(end).find((p) => p.type === "day")?.value &&
    d.formatToParts(start).find((p) => p.type === "month")?.value ===
      d.formatToParts(end).find((p) => p.type === "month")?.value &&
    d.formatToParts(start).find((p) => p.type === "year")?.value ===
      d.formatToParts(end).find((p) => p.type === "year")?.value;

  if (sameDay) {
    return `${d.format(start)} • ${t.format(start)} – ${t.format(end)}`;
  }
  return `${d.format(start)} ${t.format(start)} – ${d.format(end)} ${t.format(
    end
  )}`;
}

export async function GET(req: Request) {
  if (process.env.CRON_SECRET) {
    const auth = `Bearer ${process.env.CRON_SECRET}`;
    const headerAuth = req.headers.get("authorization");
    if (auth !== headerAuth) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  }

  const now = new Date();

  const jobs = await prisma.notification.findMany({
    where: { status: "PENDING", runAt: { lte: now } },
    include: {
      booking: {
        include: {
          service: {
            include: { provider: true },
          },
        },
      },
    },
    take: 50,
    orderBy: { runAt: "asc" },
  });

  let sent = 0,
    failed = 0;

  for (const j of jobs) {
    try {
      const b = j.booking;
      const svc = b.service;
      const pro = svc.provider;
      const providerTz = pro.timezone || "America/Edmonton";

      const start = b.startAt;
      const end =
        b.endAt ??
        new Date(start.getTime() + (svc.defaultDurationMins ?? 60) * 60 * 1000);

      const manageUrl = `${process.env.APP_URL}/bookings/${b.id}/manage?token=${
        b.manageToken ?? ""
      }`;

      const subject =
        j.kind === "BOOKING_CONFIRMATION"
          ? `Booking confirmed: ${svc.title}`
          : j.kind === "REMINDER_24H"
          ? `Reminder (24h): ${svc.title}`
          : `Reminder (2h): ${svc.title}`;

      const localRange = formatRangeInTz(start, end, providerTz);
      const utcRange = `${start
        .toISOString()
        .replace("T", " ")
        .slice(0, 16)} – ${end
        .toISOString()
        .replace("T", " ")
        .slice(0, 16)} UTC`;

      const html = `
        <div style="font-family:system-ui, -apple-system, Segoe UI, Roboto; line-height:1.5">
          <h2 style="margin:0 0 8px 0">${subject}</h2>
          <p style="margin:0 0 8px 0"><b>Provider:</b> ${
            pro.name ?? "Provider"
          }</p>
          <p style="margin:0 0 8px 0"><b>Service:</b> ${svc.title}</p>
          <p style="margin:0"><b>When (provider local):</b> ${localRange}</p>
          <p style="margin:4px 0 0 0; color:#666"><small>${utcRange}</small></p>
          <p style="margin:16px 0 8px 0">
            Manage your booking:
            <a href="${manageUrl}">${manageUrl}</a>
          </p>
        </div>`;

      const attachments =
        j.kind === "BOOKING_CONFIRMATION"
          ? (() => {
              const ics = buildBookingIcs({
                uid: `booking-${b.id}@community-booking`,
                start,
                end,
                summary: `${svc.title} with ${pro.name ?? "Provider"}`,
                description: `Booking ID: ${b.id}`,
                url: manageUrl,
                location: pro.name ?? undefined,
              });
              return [
                {
                  filename: ics.filename,
                  contentType: ics.contentType,
                  content: ics.contentBase64,
                },
              ];
            })()
          : [];

      await sendEmail({ to: j.to, subject, html, attachments });

      await prisma.notification.update({
        where: { id: j.id },
        data: {
          status: "SENT",
          sentAt: new Date(),
          attempts: { increment: 1 },
          lastError: null,
        },
      });
      sent++;
    } catch (err: any) {
      await prisma.notification.update({
        where: { id: j.id },
        data: {
          status: "FAILED",
          attempts: { increment: 1 },
          lastError: String(err?.message ?? err),
        },
      });
      failed++;
    }
  }

  return NextResponse.json({ processed: jobs.length, sent, failed });
}
