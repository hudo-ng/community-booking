"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function SiteHeader() {
  const { data: session, status } = useSession();
  const loggedIn = status === "authenticated";
  const pathName = usePathname();

  const dashboardUrl =
    session?.user?.role === "SUPERADMIN"
      ? "/root/users"
      : session?.user?.role === "PROVIDER"
      ? "/admin"
      : "/";

  const isActive = pathName === dashboardUrl;

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
                href={
                  session.user.role === "PROVIDER"
                    ? "/admin"
                    : session.user.role === "SUPERADMIN"
                    ? "/root/users"
                    : "/"
                }
                className={`px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {session.user.role === "PROVIDER" ||
                session.user.role === "SUPERADMIN"
                  ? "Dashboard"
                  : "Home"}
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
                className={`px-3 py-2 rounded-lg transition-colors ${
                  pathName === "/login"
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                Login
              </Link>
              <Link
                href="/register"
                className={`px-3 py-2 rounded-lg transition-colors ${
                  pathName === "/register"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
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
