import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — MP Admin" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f4f1ec",
  colorScheme: "light",
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <div className="admin-light min-h-dvh antialiased">{children}</div>;
}
