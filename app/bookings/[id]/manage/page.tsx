import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { cancelBooking, rescheduleBooking } from "./action";
import ToasterFromSearchParams from "@/components/ToasterFromSearchParams";

type Props = { params: { id: string }; searchParams: { token?: string } };

function formatRangeInTz(start: Date, end: Date, tz: string) {
  const dFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  const tFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });

  const sD = dFmt.formatToParts(start);
  const eD = dFmt.formatToParts(end);
  const get = (arr: Intl.DateTimeFormatPart[], type: string) =>
    arr.find((p) => p.type === type)?.value ?? "";

  const sameDay =
    get(sD, "day") === get(eD, "day") &&
    get(sD, "month") === get(eD, "month") &&
    get(sD, "year") === get(eD, "year");

  if (sameDay) {
    return `${dFmt.format(start)} • ${tFmt.format(start)} – ${tFmt.format(
      end
    )}`;
  }
  return `${dFmt.format(start)} ${tFmt.format(start)} – ${dFmt.format(
    end
  )} ${tFmt.format(end)}`;
}

function toLocalYMD(d: Date, tz: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const by = Object.fromEntries(
    parts.filter((p) => p.type !== "literal").map((p) => [p.type, p.value])
  );
  return `${by.year}-${by.month}-${by.day}`;
}

function toLocalHHMM(d: Date, tz: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const by = Object.fromEntries(
    parts.filter((p) => p.type !== "literal").map((p) => [p.type, p.value])
  );
  return `${by.hour}:${by.minute}`;
}

export default async function ManageBookingPage({
  params,
  searchParams,
}: Props) {
  const { token } = await searchParams;
  const { id } = await params;

  if (!token) return notFound();

  const b = await prisma.booking.findUnique({
    where: { id },
    include: {
      service: {
        include: {
          provider: { select: { name: true, timezone: true } },
        },
      },
    },
  });
  if (!b || !b.manageToken || b.manageToken !== token) return notFound();

  const tz = b.service.provider.timezone || "America/Edmonton";
  const start = b.startAt;
  const end =
    b.endAt ??
    new Date(start.getTime() + (b.service.defaultDurationMins ?? 60) * 60_000);

  const localRange = formatRangeInTz(start, end, tz);
  const utcRange = `${start
    .toISOString()
    .replace("T", " ")
    .slice(0, 16)} – ${end.toISOString().replace("T", " ").slice(0, 16)} UTC`;

  const cutoffH = b.service.cancellationPolicyHours ?? 0;

  const nowLocal = new Date(
    new Date().toLocaleString("en-US", { timeZone: tz })
  ).getTime();
  const startLocal = new Date(
    start.toLocaleString("en-US", { timeZone: tz })
  ).getTime();
  const msUntilStart = startLocal - nowLocal;
  const canModify = msUntilStart >= cutoffH * 60 * 60 * 1000;

  return (
    <section className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      <ToasterFromSearchParams />
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Manage Booking
        </h1>
        <p className="text-sm text-gray-500">
          Times displayed in provider’s local timezone (
          <span className="font-medium">{tz}</span>).
        </p>
      </header>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Service
            </p>
            <p className="mt-1 font-medium text-gray-900">{b.service.title}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Provider
            </p>
            <p className="mt-1 font-medium text-gray-900">
              {b.service.provider.name ?? "Provider"}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              When
            </p>
            <p className="mt-1 font-medium text-gray-900">{localRange}</p>
            <p className="text-xs text-gray-500 mt-1">{utcRange}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Status
            </p>
            <span
              className={`mt-1 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                b.status === "CONFIRMED"
                  ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200"
                  : b.status === "PENDING"
                  ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"
                  : "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200"
              }`}
            >
              {b.status}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Changes/cancellation allowed until{" "}
          <span className="font-medium">{cutoffH}h</span> before start.
          {!canModify && (
            <>
              {" "}
              <span className="text-red-600 font-medium">
                Window has passed.
              </span>
            </>
          )}
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Change time</h2>
        <form action={rescheduleBooking} className="space-y-4">
          <input type="hidden" name="bookingId" value={b.id} />
          <input type="hidden" name="token" value={token} />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                New date (provider local)
              </label>
              <input
                type="date"
                name="newStartLocalYMD"
                defaultValue={toLocalYMD(start, tz)}
                className="w-full h-11 rounded-xl border border-gray-300 bg-white px-3 text-gray-900 shadow-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                required
                disabled={!canModify}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                New time (provider local)
              </label>
              <input
                type="time"
                name="newStartLocalHHMM"
                defaultValue={toLocalHHMM(start, tz)}
                className="w-full h-11 rounded-xl border border-gray-300 bg-white px-3 text-gray-900 shadow-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                required
                disabled={!canModify}
              />
            </div>
          </div>

          <div className="pt-1">
            <button
              className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!canModify}
            >
              Reschedule
            </button>
          </div>

          {!canModify && (
            <p className="text-xs text-red-600">
              This booking can no longer be changed because it’s within{" "}
              {cutoffH}h of the start time.
            </p>
          )}
        </form>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-900">
          Cancel booking
        </h2>
        <form action={cancelBooking} className="space-y-3">
          <input type="hidden" name="bookingId" value={b.id} />
          <input type="hidden" name="t" value={token} />

          <label className="block text-sm font-medium text-gray-700">
            Reason (optional)
          </label>
          <textarea
            name="reason"
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            rows={3}
            disabled={!canModify}
          />

          <button
            className="inline-flex items-center rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!canModify}
          >
            Cancel booking
          </button>

          {!canModify && (
            <p className="text-xs text-red-600">
              This booking can no longer be canceled because it’s within{" "}
              {cutoffH}h of the start time.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
