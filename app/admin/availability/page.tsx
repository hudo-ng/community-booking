import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  addTimeOff,
  deleteTimeOff,
  createRule,
  deleteRule,
  updateService,
} from "./action";

export const metadata = { title: "Availabity & Schedule" };

export default async function AvailabityAdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "PROVIDER") redirect("/login");

  const providerId = session.user.id;

  const [rules, timeOff, services, me] = await Promise.all([
    prisma.availabilityRules.findMany({
      where: { providerId },
      orderBy: [{ weekday: "asc" }, { startLocal: "asc" }],
    }),

    prisma.timeOff.findMany({
      where: { providerId },
      orderBy: [{ startTimeUtc: "asc" }],
    }),

    prisma.service.findMany({
      where: { providerId },
      orderBy: [{ title: "asc" }],
    }),

    prisma.user.findUnique({ where: { UserId: providerId } }),
  ]);

  const tz = me?.timezone ?? "America/Edmonton";

  const fmtLocal = (d: Date) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      dateStyle: "medium",
      timeStyle: "short",
      hour12: true,
    }).format(d);

  const fmtUtc = (d: Date) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      dateStyle: "medium",
      timeStyle: "short",
      hour12: true,
    }).format(d);

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10 space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Availability & Schedule
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage weekly rules, time off, and default service durations.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Timezone: <strong className="font-medium">{tz}</strong>
        </span>
      </header>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="p-5 sm:p-6">
          <h2 className="text-xl font-semibold">Weekly schedule</h2>
          <p className="text-sm text-gray-600 mt-1">
            Define recurring availability windows and slot length for each
            weekday.
          </p>

          <div className="mt-4 -mx-5 sm:mx-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-600 bg-gray-50 sticky top-0">
                  <tr>
                    <th className="py-2.5 pl-5 pr-3 sm:pl-4">Weekday</th>
                    <th className="py-2.5 px-3">Start</th>
                    <th className="py-2.5 px-3">End</th>
                    <th className="py-2.5 px-3">Slot mins</th>
                    <th className="py-2.5 px-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rules.map((r) => (
                    <tr
                      key={r.id}
                      className="odd:bg-white even:bg-gray-50 hover:bg-blue-50/50"
                    >
                      <td className="py-2.5 pl-5 pr-3 sm:pl-4">
                        {
                          ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                            r.weekday
                          ]
                        }
                      </td>
                      <td className="py-2.5 px-3">{r.startLocal}</td>
                      <td className="py-2.5 px-3">{r.endLocal}</td>
                      <td className="py-2.5 px-3">{r.slotMins}</td>
                      <td className="py-2.5 px-3">
                        <form action={deleteRule}>
                          <input type="hidden" name="id" value={r.id} />
                          <button
                            className="inline-flex items-center rounded-lg bg-red-600 px-3 py-1.5 text-white shadow-sm
                                       hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            Delete
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                  {rules.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-6 text-center text-gray-500"
                      >
                        No rules yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <form action={createRule} className="mt-5 border-t pt-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-600">
                  Weekday
                </span>
                <select
                  name="weekday"
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 shadow-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (n, i) => (
                      <option key={i} value={i}>
                        {n}
                      </option>
                    )
                  )}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-600">
                  Start (HH:mm)
                </span>
                <input
                  name="startLocal"
                  placeholder="09:00"
                  required
                  type="time"
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 shadow-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-600">
                  End (HH:mm)
                </span>
                <input
                  name="endLocal"
                  placeholder="17:00"
                  type="time"
                  required
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 shadow-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-600">
                  Slot mins
                </span>
                <input
                  name="slotMins"
                  type="number"
                  min={15}
                  max={240}
                  step={15}
                  defaultValue={60}
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 shadow-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <div className="flex items-end">
                <button
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-medium shadow hover:bg-blue-700
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add rule
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Time off */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="p-5 sm:p-6">
          <h2 className="text-xl font-semibold">Time off</h2>
          <p className="text-sm text-gray-600 mt-1">
            Block specific periods when you’re unavailable (stored in local).
          </p>

          {/* Table */}
          <div className="mt-4 -mx-5 sm:mx-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-600 bg-gray-50 sticky top-0">
                  <tr>
                    <th className="py-2.5 pl-5 pr-3 sm:pl-4">Start</th>
                    <th className="py-2.5 px-3">End</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {timeOff.map((o) => (
                    <tr
                      key={o.id}
                      className="odd:bg-white even:bg-gray-50 hover:bg-blue-50/50"
                    >
                      <td className="py-2.5 pl-5 pr-3 sm:pl-4">
                        {fmtLocal(o.startTimeUtc)}
                      </td>
                      <td className="py-2.5 px-3">{fmtLocal(o.endTimeUtc)}</td>
                      <td className="py-2.5 px-3">{o.reason ?? ""}</td>
                      <td className="py-2.5 px-3">
                        <form action={deleteTimeOff}>
                          <input type="hidden" name="id" value={o.id} />
                          <button
                            className="inline-flex items-center rounded-lg bg-red-600 px-3 py-1.5 text-white shadow-sm
                                       hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            Delete
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                  {timeOff.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-6 text-center text-gray-500"
                      >
                        No time off.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add time off form */}
          <form action={addTimeOff} className="mt-5 border-t pt-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-600">
                  Date (provider local)
                </span>
                <input
                  name="date"
                  type="date"
                  required
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 shadow-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-600">
                  Start (HH:mm)
                </span>
                <input
                  name="start"
                  placeholder="13:00"
                  required
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 shadow-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-600">
                  End (HH:mm)
                </span>
                <input
                  name="end"
                  placeholder="17:00"
                  required
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 shadow-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="block md:col-span-1">
                <span className="mb-1 block text-xs font-medium text-gray-600">
                  Reason (optional)
                </span>
                <input
                  name="reason"
                  placeholder="Vacation"
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 shadow-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <div className="flex items-end">
                <button
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-medium shadow hover:bg-blue-700
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add time off
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Services & durations */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="p-5 sm:p-6">
          <h2 className="text-xl font-semibold">Services</h2>
          <p className="text-sm text-gray-600 mt-1">
            Update pricing and default duration for each service.
          </p>

          <div className="mt-4 -mx-5 sm:mx-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-600 bg-gray-50 sticky top-0">
                  <tr>
                    <th className="py-2.5 pl-5 pr-3 sm:pl-4">Title</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3">Default duration (mins)</th>
                    <th className="py-2.5 px-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {services.map((s) => (
                    <tr
                      key={s.id}
                      className="odd:bg-white even:bg-gray-50 hover:bg-blue-50/50 align-top"
                    >
                      <td className="py-2.5 pl-5 pr-3 sm:pl-4">{s.title}</td>
                      <td className="py-2.5 px-3">${s.price.toFixed(2)}</td>
                      <td className="py-2.5 px-3">
                        {s.defaultDurationMins ?? 60}
                      </td>
                      <td className="py-2.5 px-3">
                        <form
                          action={updateService}
                          className="flex flex-col sm:flex-row sm:flex-wrap gap-2 items-stretch sm:items-center"
                        >
                          <input type="hidden" name="id" value={s.id} />
                          <input
                            name="title"
                            placeholder="Title"
                            defaultValue={s.title}
                            className="h-10 min-w-[10rem] rounded-lg border border-gray-300 bg-white px-3 shadow-sm
                                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            name="price"
                            type="number"
                            step="0.01"
                            defaultValue={s.price}
                            className="h-10 w-28 rounded-lg border border-gray-300 bg-white px-3 shadow-sm
                                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            name="defaultDurationMins"
                            type="number"
                            min={15}
                            max={480}
                            step={15}
                            defaultValue={s.defaultDurationMins ?? 60}
                            className="h-10 w-40 rounded-lg border border-gray-300 bg-white px-3 shadow-sm
                                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white font-medium shadow
                                       hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            Save
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                  {services.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-6 text-center text-gray-500"
                      >
                        No services yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
