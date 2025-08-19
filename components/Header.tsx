"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  const pathName = usePathname();
  return (
    <header className="border-b bg-white/70 backdrop-blur sticky top-0 z-50">
      <nav className="page flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">
          <span>Community</span>
          <span className="text-gray-500"> booking</span>
        </Link>

        <ul className="flex items-center gap-3">
          {links.map((link) => {
            const active = link.href === pathName;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    active ? "bg-gray-900 text-white" : "hover:bg-gray-100"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
