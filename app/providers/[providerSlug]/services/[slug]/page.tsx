import NotFound from "@/app/not-found";
import { prisma } from "../../../../../lib/db";

type Props = {
  params: {
    providerSlug: string;
    slug: string;
  };
};
export async function generateMetaData({ params }: Props) {
  const provider = await prisma.user.findUnique({
    where: { slug: params.providerSlug },
  });
  if (!provider) return { title: "Service" };

  const service = await prisma.service.findUnique({
    where: {
      providerId_slug: {
        providerId: provider.UserId,
        slug: params.slug,
      },
    },
  });
  return { title: service ? service.title : "Service" };
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

  return (
    <article className="grid gap-6 md:grid-cols-[1fr,320px]">
      <div className="card">
        <h1 className="text-3xl font-bold">{service.title}</h1>
        <p className="mt-2 text-gray-600">{service.description}</p>
        {service.imageUrl && (
          <img
            src={service.imageUrl}
            alt=""
            className="mt-4 rounded-xl w-full object-cover"
          />
        )}
      </div>

      <aside className="card">
        <p className="text-sm text-gray-600">Provider</p>
        <p className="font-medium">{service.provider?.name ?? "Provider"}</p>
        <p className="mt-3 text-xl font-semibold">${service.price}</p>
        <a href="/contact" className="btn btn-primary mt-4 w-full">
          Contact
        </a>
      </aside>
    </article>
  );
}
