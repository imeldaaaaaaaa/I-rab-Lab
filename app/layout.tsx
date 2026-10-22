import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bedah I‘rob — Belajar Nahwu dengan Memahami",
  description: "Platform pembelajaran nahwu dan latihan analisis i‘rob bahasa Arab.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
