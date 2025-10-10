import { prisma } from "@/lib/db";
import NotFound from "@/app/not-found";

type Props = {
  params: { id: string };
  searchParams: { t?: string };
};

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
  const get = (parts: Intl.DateTimeFormatPart[], type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";

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

export default async function ManageBookingPage({
  params,
  searchParams,
}: Props) {
  const token = searchParams.t ?? "";
  if (!token) return NotFound();

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      service: {
        include: {
          provider: { select: { name: true, timezone: true } },
        },
      },
    },
  });

  if (!booking || !booking.manageToken || booking.manageToken !== token) {
    return NotFound();
  }

  const providerTz = booking.service.provider.timezone || "America/Edmonton";
  const start = booking.startAt;
  const end =
    booking.endAt ??
    new Date(
      start.getTime() + (booking.service.defaultDurationMins ?? 60) * 60 * 1000
    );

  const localRange = formatRangeInTz(start, end, providerTz);
  const utcRange = `${start
    .toISOString()
    .replace("T", " ")
    .slice(0, 16)} – ${end.toISOString().replace("T", " ").slice(0, 16)} UTC`;

  return (
    <section className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Manage Booking</h1>

      <div className="card space-y-3">
        <div>
          <p className="text-sm text-gray-600">Service</p>
          <p className="font-medium">{booking.service.title}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Provider</p>
          <p className="font-medium">
            {booking.service.provider.name ?? "Provider"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600">When (provider local)</p>
          <p className="font-medium">{localRange}</p>
          <p className="text-xs text-gray-500 mt-1">{utcRange}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Status</p>
          <p className="font-medium">{booking.status}</p>
        </div>
      </div>

      {/* Future: add cancel/reschedule actions here */}
      <div className="flex gap-3">
        <form action="get" onSubmit={(e) => e.preventDefault()}>
          <button
            className="btn btn-primary opacity-60 cursor-not-allowed"
            disabled
          >
            Reschedule (coming soon)
          </button>
        </form>
        <form action="#" onSubmit={(e) => e.preventDefault()}>
          <button className="btn opacity-60 cursor-not-allowed" disabled>
            Cancel (coming soon)
          </button>
        </form>
      </div>
    </section>
  );
}
