import type { ReactNode } from "react";
import type { Metadata } from "next";

// Metadata is used by Next.js on the server
export const metadata: Metadata = {
  title: "RealEstate SaaS",
  description: "Multi-tenant real estate SaaS platform"
};

// RootLayout is a Server Component by default (no "use client")
export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          background: "#0f172a",
          color: "#e5e7eb"
        }}
      >
        {children}
      </body>
    </html>
  );
}

