import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateService, deleteService } from "../../action";
import ToasterFromSearchParams from "@/components/ToasterFromSearchParams";


export default async function EditServicePage({ params }: any) {
  const s = await getServerSession(authOptions);
  if (!s?.user || !["PROVIDER", "ADMIN", "SUPERADMIN"].includes(s.user.role))
    redirect("/login");

  const providerId = s.user.id;
  const svc = await prisma.service.findUnique({ where: { id: params?.id } });
  if (!svc || svc.providerId !== providerId) return notFound();

  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <ToasterFromSearchParams />

      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Edit Service
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Update details, pricing, and default duration.
          </p>
        </div>
        <a
          href="/admin/services"
          className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Back
        </a>
      </header>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <form action={updateService} className="p-5 sm:p-6 space-y-6">
          <input type="hidden" name="id" value={svc.id} />

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title
            </label>
            <input
              id="title"
              name="title"
              defaultValue={svc.title}
              className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={svc.description ?? ""}
              rows={4}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What’s included, preparation, policies…"
            />
            <p className="mt-1 text-xs text-gray-500">
              This appears on the service page.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Price (CAD)
              </label>
              <div className="relative">
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min={0}
                  defaultValue={svc.price}
                  className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 pr-14 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-sm text-gray-500">
                  CAD
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="defaultDurationMins"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Default duration (mins)
              </label>
              <div className="relative">
                <input
                  id="defaultDurationMins"
                  name="defaultDurationMins"
                  type="number"
                  min={15}
                  max={480}
                  step={15}
                  defaultValue={svc.defaultDurationMins ?? 60}
                  className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 pr-12 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-sm text-gray-500">
                  min
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="imageUrl"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Image URL
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                defaultValue={svc.imageUrl ?? ""}
                placeholder="https://…"
                className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Use a 1200×800 image for best results.
              </p>
            </div>
          </div>

          {svc.imageUrl ? (
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-2">Preview</div>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={svc.imageUrl}
                  alt={svc.title}
                  className="h-48 w-full object-cover"
                />
              </div>
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row gap-3">
            <button className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-white font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Save
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5 sm:p-6">
        <form
          action={deleteService}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div>
            <h2 className="text-sm font-semibold text-red-800">Danger zone</h2>
            <p className="text-sm text-red-700/90">
              Deleting this service is permanent and cannot be undone.
            </p>
          </div>
          <input type="hidden" name="id" value={svc.id} />
          <button className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-white font-medium shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
            Delete Service
          </button>
        </form>
      </div>
    </section>
  );
}
