"use client";

import ToasterFromSearchParams from "@/components/ToasterFromSearchParams";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogInPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);

    const email = String(fd.get("email") || "");

    const password = String(fd.get("password") || "");

    const session = await getSession();
    const role = session?.user.role;

    const res = await signIn("credentials", {
      redirect: true,
      email,
      password,
      callbackUrl:
        role === "SUPERADMIN"
          ? "/root/users"
          : role === "PROVIDER"
          ? "/admin"
          : "/",
    });

    // if (res?.error) {
    //   setErr("Invalid email or password");
    //   setLoading(false);
    // } else if (res?.ok) {
    //   setTimeout(async () => {
    //     const session = await getSession();
    //     session?.user.role === "CUSTOMER"
    //       ? router.push("/")
    //       : session?.user.role === "SUPERADMIN"
    //       ? router.push("/root/users")
    //       : router.push("/admin");
    //   }, 400);
    // }
  }

  return (
    <section className="min-h-[100vh] bg-gray-50 grid place-items-center px-4">
      <ToasterFromSearchParams />
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder=""
              className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder=""
              className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-xl transition"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          {err && <p className="text-red-600 text-sm">{err}</p>}
        </form>

        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Create one
          </a>
        </p>
        <p className="text-center text-sm text-gray-500">
          Forgot password?{" "}
          <a href="/forgot-password" className="text-blue-600 hover:underline">
            Reset password
          </a>
        </p>
      </div>
    </section>
  );
}
