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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://archimedes.life/#organization",
      name: "archimedes",
      url: "https://archimedes.life",
      logo: "https://archimedes.life/icon.svg",
      founder: {
        "@type": "Person",
        name: "Adam Pang",
        url: "https://adampang.com",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://archimedes.life/#website",
      url: "https://archimedes.life",
      name: "archimedes · the leverage diagnosis",
      description,
      publisher: { "@id": "https://archimedes.life/#organization" },
    },
    {
      "@type": "Product",
      name: "archimedes founding license",
      description:
        "An interactive leverage diagnosis that identifies which of the four levers (labor, capital, code, media) you are underusing and prescribes a 90-day cure protocol.",
      brand: { "@id": "https://archimedes.life/#organization" },
      offers: {
        "@type": "Offer",
        url: "https://buy.stripe.com/9B64gz7Z00Oh5kc9WFaMU0E",
        price: "49",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
