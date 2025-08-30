"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function SiteHeader() {
  const { data: session, status } = useSession();
  const loggedIn = status === "authenticated";
  return (
    <header className="border-b bg-white/70 backdrop-blur sticky top-0 z-50">
      <nav className="page flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">
          <span>Community</span>
          <span className="text-gray-500"> booking</span>
        </Link>

        <div className="flex items-center gap-3">
          {loggedIn ? (
            <>
              <Link
                href={session.user.role === "PROVIDER" ? "/admin" : "/"}
                className="px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                {session.user.role === "PROVIDER" ? "Dashboard" : "Home"}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-3 py-2 rounded-lg bg-gray-900 text-white"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
