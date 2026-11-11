import type { Metadata, Viewport } from "next";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import { fontVariables } from "./fonts";
import "./globals.css";

const SITE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://three15management.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Three15 Management — Model Agency",
    template: "%s — Three15 Management",
  },
  description:
    "Three15 Management is an international model management agency representing women, men, plus sizes, kids and talents for fashion, commercial and digital campaigns.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: SITE,
    siteName: "Three15 Management",
    title: "Three15 Management — Model Agency",
    description:
      "International model management representing women, men, plus sizes, kids and talents.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Three15 Management",
    description:
      "International model management representing women, men, plus sizes, kids and talents.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#f3efe8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="flex min-h-dvh flex-col">
        <OrganizationJsonLd />
        {children}
      </body>
    </html>
  );
}
