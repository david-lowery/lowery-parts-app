import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lowery Parts App",
  description: "Internal parts request app for Lowery Distributing",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
