import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Call Bridge",
  description: "Live interpreted calls for families and institutions.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* suppressHydrationWarning: browser extensions like Grammarly inject
          attributes into <body> before React loads, which triggers a harmless
          dev-mode warning. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
