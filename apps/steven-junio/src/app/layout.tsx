import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "@radix-ui/themes/styles.css";
import { Analytics } from "@vercel/analytics/react";
import { Theme } from "@radix-ui/themes";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.stevenjunio.com"),
  title: {
    default: "Steven Junio",
    template: "%s | Steven Junio",
  },
  description: "Steven Junio's software development portfolio and projects.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "My Agent",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "Steven Junio",
    description: "Steven Junio's software development portfolio and projects.",
    siteName: "Steven Junio",
    images: [
      {
        url: "/images/steven-junio-screenshot.webp",
        width: 1200,
        height: 630,
        alt: "Steven Junio's software development portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Steven Junio",
    description: "Steven Junio's software development portfolio and projects.",
    images: ["/images/steven-junio-screenshot.webp"],
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Theme>{children} </Theme>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
