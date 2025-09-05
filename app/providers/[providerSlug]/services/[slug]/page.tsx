import NotFound from "@/app/not-found";
import { prisma } from "../../../../../lib/db";
import BookingWidget from "@/components/BookingWidget";

type Props = {
  params: {
    providerSlug: string;
    slug: string;
  };
};

export async function generateMetadata({ params }: Props) {
  const provider = await prisma.user.findUnique({
    where: { slug: params.providerSlug },
  });
  if (!provider) return { title: "Service" };

  const service = await prisma.service.findUnique({
    where: {
      providerId_slug: {
        providerId: provider.UserId,
        slug: params?.slug,
      },
    },
  });

  return {
    title: service ? service.title : "Service",
  };
}

export default async function ServiceDetail({ params }: Props) {
  const provider = await prisma.user.findUnique({
    where: { slug: params.providerSlug },
  });
  if (!provider) return NotFound();

  const service = await prisma.service.findUnique({
    where: {
      providerId_slug: {
        providerId: provider.UserId,
        slug: params.slug,
      },
    },
    include: { provider: true },
  });

  if (!service) return NotFound();

  const price = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 2,
  }).format(service.price ?? 0);

  return (
    <article className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
          {service.provider?.name ?? "Provider"}
        </span>
        <span className="select-none">•</span>
        <span className="truncate">{service.title}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="p-5 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {service.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Available
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 px-2.5 py-1">
                <span className="text-xs font-medium">Price</span>
                <span className="font-semibold">{price}</span>
              </span>
            </div>

            {service.imageUrl && (
              <div className="mt-5 overflow-hidden rounded-xl">
                <img
                  src={service.imageUrl}
                  alt={service.title}
                  className="h-64 w-full object-cover sm:h-80"
                />
              </div>
            )}

            {service.description && (
              <div className="prose prose-sm sm:prose base mt-5 max-w-none text-gray-700">
                <p className="leading-relaxed">{service.description}</p>
              </div>
            )}

            <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 p-4">
                <dt className="text-xs uppercase tracking-wide text-gray-500">
                  Provider
                </dt>
                <dd className="mt-1 font-medium">
                  {service.provider?.name ?? "Provider"}
                </dd>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <dt className="text-xs uppercase tracking-wide text-gray-500">
                  Contact
                </dt>
                <dd className="mt-1 text-sm text-gray-700">
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-white hover:bg-gray-800"
                  >
                    Contact provider
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Provider
            </p>
            <p className="mt-1 font-medium text-gray-900">
              {service.provider?.name ?? "Provider"}
            </p>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="text-2xl font-semibold">{price}</p>
              <a
                href="/contact"
                className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
              >
                Contact
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
            <BookingWidget
              serviceId={service.id}
              providerId={provider.UserId}
              slug={service.slug}
              providerSlug={provider.slug ?? ""}
            />
          </div>

          <p className="text-[11px] text-gray-500">
            Times are saved in your local timezone. You’ll receive a
            confirmation email after booking.
          </p>
        </aside>
      </div>
    </article>
  );
}
