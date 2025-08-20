import Link from "next/link";
import { prisma } from "../../lib/db";

export const metadata = { title: "Services" };

export default async function ServicePage() {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "desc" },
    include: { provider: true },
  });
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Services</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg: grid-cols-3">
        {services.map((service) => (
          <Link
            key={service.id}
            href={`providers/${service.providerId}/services/${service.slug}`}
            className="card block hover:shadow"
          >
            {service.imageUrl && <img src={service.imageUrl} alt="" />}
            <h3 className="text-lg font-semibold">{service.title}</h3>
            <p className="text-sm text-gray-600">
              {service.provider?.name ?? "Provider"}
            </p>
            <p className="mt-2 font-medium">{service.price}$</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
