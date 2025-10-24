import Link from "next/link";
import { prisma } from "../../lib/db";

export const metadata = { title: "Services" };

type Props = {
  searchParams: Promise<{ q?: string; scope?: "all" | "providers" | "services" }>;
};

export default async function ServicePage({ searchParams }: Props) {
  const {q} = await(searchParams ?? "");
  const {scope} =  await (searchParams ?? "all");

  const serviceFields = q
    ? [
        { title: { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
      ]
    : [];

  const providerFields = q
    ? [
        {
          provider: {
            is: { name: { contains: q, mode: "insensitive" as const } },
          },
        },
        {
          provider: {
            is: { slug: { contains: q, mode: "insensitive" as const } },
          },
        },
      ]
    : [];

  const orParts = [
    ...(scope !== "providers" ? serviceFields : []),
    ...(scope !== "services" ? providerFields : []),
  ];

  const where = q && orParts.length > 0 ? { OR: orParts } : undefined;

  const services = await prisma.service.findMany({
    where: { ...where, provider: { isActive: true } },
    orderBy: { createdAt: "desc" },
    include: { provider: { select: { UserId: true, name: true, slug: true } } },
    take: 10,
  });
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Services
          </h1>
          {q ? (
            <p className="mt-1 text-sm text-gray-600">
              Showing results for <span className="font-medium">“{q}”</span> (
              {scope})
            </p>
          ) : (
            <p className="mt-1 text-sm text-gray-500">
              Browse and book from available services.
            </p>
          )}
        </div>
      </header>

      <form
        method="get"
        role="search"
        className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm"
      >
        <div className="grid grid-cols-1 sm:grid-cols-[1fr,14rem,auto] gap-3">
          <div className="relative">
            <input
              defaultValue={q}
              placeholder="Search services or providers…"
              name="q"
              aria-label="Search"
              className="w-full h-11 rounded-xl border border-gray-300 bg-white pl-10 pr-3 text-gray-900 placeholder:text-gray-400 shadow-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M11 18a7 7 0 1 1 4.95-2.05L21 21"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="relative">
            <select
              name="scope"
              defaultValue={scope}
              className="w-full h-11 appearance-none rounded-xl border border-gray-300 bg-white px-3 text-gray-900 shadow-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              aria-label="Filter scope"
            >
              <option value="all">All</option>
              <option value="services">Service</option>
              <option value="providers">Provider</option>
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <button
            className="inline-flex items-center justify-center h-11 rounded-xl bg-gray-900 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            type="submit"
          >
            Search
          </button>
        </div>
      </form>

      {services.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600">
          <div className="mx-auto mb-3 h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <svg
              className="h-5 w-5 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M11 18a7 7 0 1 1 4.95-2.05L21 21"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="font-medium">No results found</p>
          <p className="mt-1 text-sm text-gray-500">
            Try a different search term or scope.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const price = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "CAD",
              maximumFractionDigits: 2,
            }).format(service.price ?? 0);

            return (
              <Link
                key={service.id}
                href={`/providers/${service.provider.slug}/services/${service.slug}`}
                className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                  {service.imageUrl ? (
                    <img
                      src={service.imageUrl}
                      alt={service.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      <svg
                        className="h-8 w-8"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M4 5h16v14H4z M4 15l4-4 3 3 5-5 4 4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 shadow-sm">
                    {price}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                    {service.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                      {service.provider?.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="truncate">
                      {service.provider?.name ?? "Provider"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
