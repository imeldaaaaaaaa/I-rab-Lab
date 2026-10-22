import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Bedah I'rab — Laboratorium Nahwu",
  description: 'Latihan interaktif untuk membedah kata dan memahami kaidah i‘rab bahasa Arab.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
