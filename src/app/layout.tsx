import type { Metadata, Viewport } from "next";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Three15 Management",
    template: "%s — Three15 Management",
  },
  description:
    "Three15 Management is an international model management agency representing women, men, plus sizes, kids and talents.",
};

export const viewport: Viewport = {
  themeColor: "#f3efe8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
