import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/db";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "PROVIDER") redirect("/");
  console.log(session);

  const services = await prisma.service.findMany({
    where: { providerId: session.user.id },
    include: { provider: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">My Services</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <a
            key={s.id}
            className="card block hover:shadow"
            href={`/providers/${s.provider.UserId}/services/${s.slug}`}
          >
            <h3 className="text-lg font-semibold">{s.title}</h3>
            <p className="text-sm text-gray-600">${s.price}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
