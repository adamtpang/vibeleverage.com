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
  "Diagnose which of the four levers (code, media, capital, labor) is holding you back, get a cure protocol, and unlock the $49 founding license.";

export const metadata: Metadata = {
  metadataBase: new URL("https://archimedes.life"),
  title: {
    default: title,
    template: "%s · archimedes",
  },
  description,
  applicationName: "archimedes",
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

// Note: the founding license (Product/Offer) is nested under the
// Organization via `makesOffer` rather than as a top-level @graph node, so
// the homepage's primary entity stays WebSite (this is a genuine landing
// page for the diagnostic tool, not a product page). No WebSite
// potentialAction/SearchAction is included because the site has no working
// search feature; a placeholder SearchAction would be fabricated data.
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
      makesOffer: {
        "@type": "Offer",
        url: "https://buy.stripe.com/9B64gz7Z00Oh5kc9WFaMU0E",
        price: "49",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        itemOffered: {
          "@type": "Product",
          name: "archimedes founding license",
          description:
            "An interactive leverage diagnosis that identifies which of the four levers (labor, capital, code, media) you are underusing and prescribes a 90-day cure protocol.",
        },
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://archimedes.life/#website",
      url: "https://archimedes.life",
      name: "archimedes · the leverage diagnosis",
      description,
      author: { "@id": "https://archimedes.life/#organization" },
      publisher: { "@id": "https://archimedes.life/#organization" },
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
