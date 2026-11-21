import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import QueryProvider from "@/lib/api/QueryProvider";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], weight: ["400", "500"], display: "swap" });

export const metadata: Metadata = {
  title: "CurhatKu — Semua perasaan layak punya tempat",
  description:
    "Curhat anonim dengan deteksi emosi di perangkatmu, forum, artikel, dan konsultasi psikolog terjangkau.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d16" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${geist.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-invert focus:px-4 focus:py-2 focus:text-on-invert"
        >
          Lewati ke konten
        </a>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
