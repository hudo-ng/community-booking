import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/Header";
import SiteFooter from "@/components/Footer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import AuthContextProvider from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Community Booking",
    template: "%s • Community Booking",
  },
  description: "Find and book trusted local services with ease.",
  metadataBase: new URL("https://community-booking.example.com"),
  openGraph: {
    title: "Community Booking",
    description: "Find and book trusted local services with ease.",
    type: "website",
    url: "https://community-booking.example.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Community Booking",
    description: "Find and book trusted local services with ease.",
  },
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthContextProvider session={session}>
          <SiteHeader />
          <main className="page py-8 flex-1">{children}</main>
          <SiteFooter />
        </AuthContextProvider>
      </body>
    </html>
  );
}
