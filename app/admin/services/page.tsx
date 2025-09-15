import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import ToasterFromSearchParams from "@/components/ToasterFromSearchParams";

export default async function AdminListServicePage() {
  const session = await getServerSession(authOptions);
  if (
    !session?.user ||
    !["PROVIDER", "ADMIN", "SUPERADMIN"].includes(session.user.role)
  )
    redirect("/login");

  const services = await prisma.service.findMany({
    where: { providerId: session.user.id },
    include: { provider: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <ToasterFromSearchParams />
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          My Services
        </h1>
        <Link
          href="/admin/services/new"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white font-medium shadow-sm
                 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" className="-ml-0.5">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          New Service
        </Link>
      </header>

      {services.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="text-gray-700 font-medium">You have no services yet.</p>
          <p className="mt-1 text-sm text-gray-500">
            Create your first service to start accepting bookings.
          </p>
          <div className="mt-4">
            <Link
              href="/admin/services/new"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white font-medium shadow-sm
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create service
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const price = new Intl.NumberFormat("en-CA", {
              style: "currency",
              currency: "CAD",
            }).format(s.price ?? 0);

            return (
              <div
                key={s.id}
                className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm
                       transition hover:shadow-md focus-within:shadow-md"
              >
                <h3 className="text-lg font-semibold leading-tight">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600 truncate">
                  {s.description ?? "—"}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                    {price}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/services/${s.id}/edit`}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-900
                             shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/providers/${s.provider.slug}/services/${s.slug}`}
                      className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm
                             hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
