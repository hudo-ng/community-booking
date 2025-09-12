"use client";

import { useFormStatus } from "react-dom";
import { useActionState, useEffect } from "react";
import createBooking from "@/app/bookings/action";
import type { BookingState } from "@/app/bookings/action";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-11 rounded-xl bg-blue-600 text-white font-medium shadow-sm transition
                 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Booking..." : "Book now"}
    </button>
  );
}

const initialState: BookingState = { ok: false };

export default function BookingWidget(props: {
  serviceId: string;
  providerId: string;
  providerSlug?: string;
  slug: string;
  defaultDuration?: number;
}) {
  const [state, formAction] = useActionState(createBooking, initialState);

  useEffect(() => {
    const handler = (e: any) => {
      const iso = e.detail?.isoUtc as string;
      if (!iso) return;
      const d = new Date(iso);
      const pad = (n: number) => String(n).padStart(2, "0");
      const value =
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
        `T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      const input = document.querySelector<HTMLInputElement>(
        'input[name="startAt"]'
      );
      if (input) input.value = value;
    };
    window.addEventListener("set-booking-start", handler as any);
    return () =>
      window.removeEventListener("set-booking-start", handler as any);
  }, []);

  return (
    <div
      className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-md space-y-4"
      role="region"
      aria-label="Booking widget"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            Book this service
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Your time is saved in your local timezone
          </p>
        </div>
        <div className="hidden sm:block text-[11px] text-gray-500">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-1 align-middle" />
          Secure form
        </div>
      </div>

      {state.message && (
        <p
          className={`text-sm rounded-lg px-3 py-2 ${
            state.ok
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {state.message}
        </p>
      )}

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="serviceId" value={props.serviceId} />
        <input type="hidden" name="providerId" value={props.providerId} />
        <input type="hidden" name="providerSlug" value={props.providerSlug} />
        <input type="hidden" name="slug" value={props.slug} />
        <input
          type="hidden"
          name="tzOffset"
          value={String(new Date().getTimezoneOffset())}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label
              htmlFor="customerName"
              className="block text-sm font-medium text-gray-700"
            >
              Your name <span className="text-red-500">*</span>
            </label>
            <input
              id="customerName"
              name="customerName"
              required
              aria-invalid={!!state.fieldErrors?.customerName?.length}
              className="w-full h-11 rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900
                         placeholder:text-gray-400 shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Jane Doe"
            />
            {!!state.fieldErrors?.customerName?.length && (
              <p className="text-red-600 text-xs">
                {state.fieldErrors.customerName[0]}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="customerEmail"
              className="block text-sm font-medium text-gray-700"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="customerEmail"
              name="customerEmail"
              type="email"
              autoComplete="email"
              required
              aria-invalid={!!state.fieldErrors?.customerEmail?.length}
              className="w-full h-11 rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900
                         placeholder:text-gray-400 shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="jane@example.com"
            />
            {!!state.fieldErrors?.customerEmail?.length && (
              <p className="text-red-600 text-xs">
                {state.fieldErrors.customerEmail[0]}
              </p>
            )}
          </div>

          <div className="space-y-1 sm:col-span-1">
            <label
              htmlFor="customerPhone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone (optional)
            </label>
            <input
              id="customerPhone"
              name="customerPhone"
              autoComplete="tel"
              className="w-full h-11 rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900
                         placeholder:text-gray-400 shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(555) 555-5555"
            />
          </div>

          <div className="space-y-1 sm:col-span-1">
            <label
              htmlFor="startAt"
              className="block text-sm font-medium text-gray-700"
            >
              Preferred start <span className="text-red-500">*</span>
            </label>
            <input
              id="startAt"
              name="startAt"
              type="datetime-local"
              required
              aria-invalid={!!state.fieldErrors?.startAt?.length}
              className="w-full h-11 rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900
                         placeholder:text-gray-400 shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {!!state.fieldErrors?.startAt?.length && (
              <p className="text-red-600 text-xs">
                {state.fieldErrors.startAt[0]}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="durationMins"
            className="block text-sm font-medium text-gray-700"
          >
            Duration
          </label>
          <select
            id="durationMins"
            name="durationMins"
            defaultValue={props.defaultDuration ?? 60}
            className="w-full h-11 rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900
                       shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={30}>30 minutes</option>
            <option value={60}>60 minutes</option>
            <option value={90}>90 minutes</option>
            <option value={120}>120 minutes</option>
          </select>
          {!!state.fieldErrors?.durationMins?.length && (
            <p className="text-red-600 text-xs">
              {state.fieldErrors.durationMins[0]}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700"
          >
            Notes (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900
                       placeholder:text-gray-400 shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Anything we should know ahead of time?"
          />
        </div>

        <SubmitButton />

        <p className="text-[11px] text-gray-500">
          By booking you agree to our standard cancellation policy.
        </p>
      </form>
    </div>
  );
}
