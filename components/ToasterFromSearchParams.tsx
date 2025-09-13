"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
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

export default function ToasterFromSearchParams() {
  const sp = useSearchParams();
  const router = useRouter();

  const message = sp.get("m");
  const type = (sp.get("t") as "success" | "error" | null) ?? null;
  const [open, setOpen] = useState<boolean>(Boolean(message));

  useEffect(() => setOpen(Boolean(message)), [message]);

  useEffect(() => {
    if (!message || !open) return;
    const id = setTimeout(() => {
      setOpen(false);
      router.replace("/root/users");
    }, 3000);
    return () => clearTimeout(id);
  }, [open, message, router]);

  const close = useMemo(
    () => () => {
      setOpen(false), router.replace("/root/users");
    },
    [router]
  );

  if (!open || !message || !type) return null;
  return <Toast message={message} type={type} onClose={close} />;
}
