import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stillframe — A private family gallery",
  description: "A quiet place for the moments that matter.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
