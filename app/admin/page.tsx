import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import ToasterFromSearchParams from "@/components/ToasterFromSearchParams";
import ResendVerificationButton from "@/components/VerificationButton";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminHome() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role as string | undefined;

  if (
    !session?.user ||
    !["PROVIDER", "ADMIN", "SUPERADMIN"].includes(role as string)
  ) {
    redirect("/login");
  }

  const providerId = session.user.id;
  const emailVerified = session.user.emailVerified;

  const now = new Date();
  const [serviceCount, pendingCount, upcomingCount] = await Promise.all([
    prisma.service.count({ where: { providerId } }),
    prisma.booking.count({
      where: { status: "PENDING", service: { providerId } },
    }),
    prisma.booking.count({
      where: {
        status: "CONFIRMED",
        startAt: { gte: now },
        service: { providerId },
      },
    }),
  ]);

  const roleBadge =
    role === "SUPERADMIN"
      ? "bg-rose-100 text-rose-800 border-rose-200"
      : role === "ADMIN"
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : role === "PROVIDER"
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : "bg-gray-100 text-gray-800 border-gray-200";

  if (!emailVerified) return <ResendVerificationButton />;

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <ToasterFromSearchParams />
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Signed in as{" "}
            <span className="font-medium text-gray-900">
              {session.user?.email}
            </span>
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${roleBadge}`}
          title="Current role"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current/80" />
          {role}
        </span>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/admin/services"
          className="group block rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm transition
                     hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div className="flex items-start justify-between">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Services
            </div>
            <span className="rounded-full bg-blue-50 p-2 text-blue-700">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M5 7h14M5 12h14M5 17h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </div>
          <div className="mt-2 text-3xl font-bold">{serviceCount}</div>
          <div className="mt-1 text-sm text-gray-600">Manage your services</div>
        </Link>

        <Link
          href="/admin/bookings"
          className="group block rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm transition
                     hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div className="flex items-start justify-between">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Bookings
            </div>
            <span className="rounded-full bg-emerald-50 p-2 text-emerald-700">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M8 7h8M6 11h12M9 15h9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </div>
          <div className="mt-2 text-3xl font-bold">{upcomingCount}</div>
          <div className="mt-1 text-sm text-gray-600">
            Upcoming confirmed •{" "}
            <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-0.5 text-yellow-800">
              {pendingCount} pending
            </span>
          </div>
        </Link>

        <Link
          href="/admin/availability"
          className="group block rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm transition
                     hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div className="flex items-start justify-between">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Availability
            </div>
            <span className="rounded-full bg-indigo-50 p-2 text-indigo-700">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M7 8h10M7 12h7M7 16h5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </div>
          <div className="mt-2 text-3xl font-bold">Set</div>
          <div className="mt-1 text-sm text-gray-600">
            Weekly schedule & time off
          </div>
        </Link>
      </div>

      {role === "SUPERADMIN" && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Superadmin</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href="/root/users"
              className="group block rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm transition
                         hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="flex items-start justify-between">
                <div className="text-xs uppercase tracking-wide text-gray-500">
                  Users
                </div>
                <span className="rounded-full bg-rose-50 p-2 text-rose-700">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 7a3 3 0 1 1 0 6a3 3 0 0 1 0-6Zm-7 12a7 7 0 0 1 14 0"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </div>
              <div className="mt-2 text-3xl font-bold">Users</div>
              <div className="mt-1 text-sm text-gray-600">
                Grant/Revoke roles
              </div>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
