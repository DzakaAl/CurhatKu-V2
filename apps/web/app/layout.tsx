import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import QueryProvider from "@/lib/api/QueryProvider";
import "./globals.css";

const schibsted = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CurhatKu — Alur curhatmu",
  description:
    "Curhat anonim dengan deteksi emosi di perangkatmu, forum, artikel, dan konsultasi psikolog terjangkau.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f4fb" },
    { media: "(prefers-color-scheme: dark)", color: "#14122b" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${schibsted.variable} h-full antialiased`}>
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
