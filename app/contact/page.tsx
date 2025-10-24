"use client";

import { useState } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(formData: FormData) {
    alert(`Form received: ${formData.get("message") || ""}`)
    setStatus("loading");
    await new Promise((res) => setTimeout(res, 500));
    setStatus("sent");
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold">Contact Us</h1>
      <p className="text-gray-600 mt-2">We usually reply within 24 hours.</p>

      <form
        className="card mt-6 space-y-4"
        action={(fd) => {
          handleSubmit(fd);
        }}
      >
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            name="name"
            required
            className="mt-1 w-full rounded-xl border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-xl border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Message</label>
          <textarea
            name="message"
            rows={3}
            className="mt-1 w-full rounded-xl border px-3 py-2"
          ></textarea>
        </div>

        <button
          className="btn btn-primary"
          disabled={status === "loading" || status === "sent"}
        >
          {status === "loading"
            ? "Sending..."
            : status === "sent"
            ? "Sent ✓"
            : "Send"}
        </button>
      </form>
    </div>
  );
}
