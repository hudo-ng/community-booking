"use client";

import { redirect } from "next/navigation";
import { useState } from "react";

export default function ResendVerificationButton({
  defaultEmail = "",
}: {
  defaultEmail?: string;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [pending, setPending] = useState(false);

  async function onClick() {
    if (!email) return;
    setPending(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      redirect(
        `${process.env.APP_URL}/login?t=success&m=${encodeURIComponent(
          "If an account exists, we sent a verification email."
        )}`
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="email"
        value={email}
        placeholder=""
        onChange={(e) => setEmail(e.target.value)}
        className="border rounded px-3 py-2"
      />
      <button
        type="button"
        onClick={onClick}
        disabled={pending || !email}
        className="btn"
      >
        {pending ? "Sending…" : "Resend verification"}
      </button>
    </div>
  );
}
