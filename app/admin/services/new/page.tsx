"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import { redirect } from "next/navigation";
import { createService } from "../action";
import ToasterFromSearchParams from "@/components/ToasterFromSearchParams";

export default async function AddNewServicePage() {
  const session = await getServerSession(authOptions);
  if (
    !session?.user ||
    !["PROVIDER", "ADMIN", "SUPERADMIN"].includes(session.user.role)
  )
    redirect("/login");

  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <ToasterFromSearchParams />
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          New Service
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Create a service your clients can book.
        </p>
      </header>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <form action={createService} className="p-5 sm:p-6 space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              required
              className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-gray-900 shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 60-minute Massage"
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
              rows={4}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What’s included, preparation, policies…"
            />
            <p className="mt-1 text-xs text-gray-500">
              You can edit this later.
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
                  defaultValue={50}
                  className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 pr-14 text-gray-900 shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  defaultValue={60}
                  className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 pr-12 text-gray-900 shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                Image URL (optional)
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                placeholder="https://…"
                className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-gray-900 shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Use a 1200×800 image for best results.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-white font-medium shadow-sm
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create
            </button>
            <a
              href="/admin/services"
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 font-medium text-gray-900 shadow-sm
                     hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </section>
  );
}
