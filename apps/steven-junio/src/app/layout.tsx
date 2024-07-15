import "./globals.css";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "@radix-ui/themes/styles.css";
import { Analytics } from "@vercel/analytics/react";
import { Theme } from "@radix-ui/themes";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Steven Junio",
  description: "Steven Junio's personal website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script id="a-script"></script>
      </head>
      <UserProvider>
        <body className="min-h-screen">
          <Theme>{children} </Theme>
          <SpeedInsights />
          <Analytics />
        </body>
      </UserProvider>
    </html>
  );
}
