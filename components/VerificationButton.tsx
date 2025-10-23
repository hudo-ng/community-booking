"use client";

import { redirect } from "next/navigation";
import { useState } from "react";

export default function ResendVerificationButton() {
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });
      redirect(
        `/login?t=success&m=${encodeURIComponent(
          "If an account exists, we sent a verification email."
        )}`
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200">
      <h2 className="text-sm sm:text-base font-medium">
        Your email has not been verified. Please verify to proceed.
      </h2>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className={`rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-150 
      ${
        pending
          ? "bg-blue-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-blue-950"
      }`}
      >
        {pending ? "Sending…" : "Resend Verification"}
      </button>
    </div>
  );
}
