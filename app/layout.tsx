import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const title = "archimedes · the leverage diagnosis";
const description =
  "You don't have an effort problem. You have a leverage problem. We diagnose the four levers you're under-using (code, media, capital, labor) and prescribe the one move that pulls each.";

export const metadata: Metadata = {
  metadataBase: new URL("https://archimedes.life"),
  title: {
    default: title,
    template: "%s · archimedes",
  },
  description,
  applicationName: "archimedes",
  keywords: [
    "leverage",
    "leverage diagnosis",
    "code",
    "media",
    "capital",
    "labor",
    "productivity",
    "compounding",
    "archimedes",
  ],
  authors: [{ name: "archimedes" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://archimedes.life",
    siteName: "archimedes",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b0a08",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
