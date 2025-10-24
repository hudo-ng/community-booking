import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import { redirect } from "next/navigation";
import { setBookingStatus } from "./actions";

export const metadata = { title: "Bookings" };

export default async function AdminBookingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "PROVIDER") redirect("/");

  const bookings = await prisma.booking.findMany({
    where: { service: { providerId: session.user.id } },
    orderBy: { startAt: "asc" },
    include: { service: true },
  });

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Upcoming Bookings
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage and update your upcoming customer bookings.
          </p>
        </div>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <table className="w-full text-sm text-left text-gray-700 dark:text-gray-200">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wide">
            <tr>
              <th className="py-3.5 px-4">Service</th>
              <th className="py-3.5 px-4">When</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {bookings.map((b) => (
              <tr
                key={b.id}
                className="transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/30"
              >
                <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                  {b.service.title}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="text-gray-800 dark:text-gray-200 font-medium">
                    {b.startAt.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    → {b.endAt?.toLocaleString()}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium">{b.customerName ?? "—"}</div>
                  <div className="text-xs text-gray-500">{b.customerEmail}</div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize
                ${
                  b.status === "CONFIRMED"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                    : b.status === "CANCELLED"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        b.status === "CONFIRMED"
                          ? "bg-green-600"
                          : b.status === "CANCELLED"
                          ? "bg-red-600"
                          : "bg-gray-500"
                      }`}
                    />
                    {b.status.toLowerCase()}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-right">
                  <form className="inline-flex gap-2">
                    <input type="hidden" name="id" value={b.id} />
                    {b.endAt && b.endAt < new Date() ? (
                      <div className="text-xs text-gray-400 italic select-none">
                        Past appointment
                      </div>
                    ) : (
                      <>
                        <button
                          formAction={setBookingStatus.bind(null, "CONFIRMED")}
                          disabled={b.status === "CONFIRMED"}
                          className="rounded-md bg-green-600 px-3 py-1.5 text-white text-xs font-semibold shadow-sm 
                     hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500
                     disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Confirm
                        </button>

                        <button
                          formAction={setBookingStatus.bind(null, "CANCELLED")}
                          disabled={b.status === "CANCELLED"}
                          className="rounded-md bg-red-600 px-3 py-1.5 text-white text-xs font-semibold shadow-sm 
                     hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500
                     disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </form>
                </td>
              </tr>
            ))}

            {bookings.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-center text-gray-500 dark:text-gray-400 text-sm"
                >
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Changes take effect immediately on next refresh.
      </p>
    </section>
  );
}
