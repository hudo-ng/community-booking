"use client";

import { formatSlotLabel } from "@/lib/availability";

export default function Slots({
  days,
  providerTz,
}: {
  days: { ymd: string; iso: string[] }[];
  providerTz: string;
}) {
  return (
    <div>
      <p className="mb-2 text-sm text-gray-600">
        Available times{" "}
        <span className="text-gray-400">(shown in {providerTz})</span>
      </p>

      <div className="rounded-xl border border-gray-200 bg-white/70 p-3 shadow-sm">
        <div className="max-h-[300px] space-y-4 overflow-auto pr-2">
          {days.map(({ ymd, iso }) => (
            <div key={ymd} className="space-y-2">
              <div className="sticky top-0 z-10 -mx-3 px-3 py-1.5 bg-white/90 backdrop-blur">
                <p className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-gray-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  {ymd}
                </p>
              </div>

              <div className="mt-1 flex flex-wrap gap-2">
                {iso.length === 0 ? (
                  <span className="select-none rounded-full bg-gray-100 px-2.5 py-1 text-xs italic text-gray-400">
                    — No slots —
                  </span>
                ) : (
                  iso.map((u) => (
                    <button
                      key={u}
                      type="button"
                      data-iso={u}
                      title={formatSlotLabel(u, providerTz)}
                      aria-label={formatSlotLabel(u, providerTz)}
                      onClick={() => {
                        const ev = new CustomEvent("set-booking-start", {
                          detail: { isoUtc: u },
                        });
                        window.dispatchEvent(ev);
                      }}
                      className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm
                                     text-gray-900 shadow-sm transition
                                     hover:border-blue-500 hover:bg-blue-50
                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {formatSlotLabel(u, providerTz)}
                    </button>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
