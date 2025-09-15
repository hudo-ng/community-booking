"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);
  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        role="status"
        aria-live="polite"
        className={`rounded-lg shadow-lg px-4 py-3 text-sm text-white ${
          type === "error" ? "bg-red-600" : "bg-green-600"
        }`}
      >
        <div className="flex items-start gap-3">
          <span>{message}</span>
          <button
            onClick={onClose}
            className="ml-2 opacity-80 hover:opacity-100"
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

type ToastType = "success" | "error" | "info";

export default function ToasterFromSearchParams() {
  const sp = useSearchParams();
  const router = useRouter();

  const message = sp.get("m");
  const typeParam = sp.get("t");
  const type: ToastType | null =
    typeParam === "success" || typeParam === "error" || typeParam === "info"
      ? (typeParam as ToastType)
      : null;

  const [open, setOpen] = useState(Boolean(message && type));

  useEffect(() => setOpen(Boolean(message && type)), [message, type]);

  const close = useMemo(
    () => () => {
      setOpen(false);
      const params = new URLSearchParams(Array.from(sp.entries()));
      params.delete("m");
      params.delete("t");
      const qs = params.toString();
      router.replace(`${window.location.pathname}${qs ? `?${qs}` : ""}`, {
        scroll: false,
      });
    },
    [sp, router]
  );

  if (!open || !message || !type) return null;
  return <Toast message={message} type={type} onClose={close} />;
}
