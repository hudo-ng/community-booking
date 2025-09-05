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
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Upcoming bookings</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-gray-600">
            <tr>
              <th className="py-2 pr-4">Service</th>
              <th className="py-2 pr-4">When</th>
              <th className="py-2 pr-4">Customer</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="py-2 pr-4">{b.service.title}</td>
                <td className="py-2 pr-4">
                  {b.startAt.toLocaleString()} → {b.endAt?.toLocaleString()}
                </td>
                <td className="py-2 pr-4">
                  {b.customerName}
                  <br />
                  <span className="text-gray-500">{b.customerEmail}</span>
                </td>
                <td className="py-2 pr-4">{b.status}</td>
                <td className="py-2 pr-4">
                  <form action={setBookingStatus} className="inline-flex gap-2">
                    <input type="hidden" name="id" value={b.id} />
                    <button
                      formAction={setBookingStatus.bind(null, "CONFIRMED")}
                      className="px-2 py-1 rounded bg-green-600 text-white"
                    >
                      Confirm
                    </button>

                    <button
                      formAction={setBookingStatus.bind(null, "CANCELLED")}
                      className="px-2 py-1 rounded bg-red-600 text-white"
                    >
                      Cancel
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-gray-500">
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
