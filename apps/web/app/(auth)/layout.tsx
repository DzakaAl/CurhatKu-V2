import Link from "next/link";
import type { ReactNode } from "react";
import { LogoMark, Wordmark } from "@/components/brand/Logo";

const POINTS = ["Curhat pribadi, hanya kamu yang bisa membaca", "Forum dengan nama samaran", "Sesi dengan psikolog berlisensi"];

/** Layout auth: panel biru di kiri (desktop), form di kanan. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-invert p-12 text-on-invert lg:flex">
        <Link href="/" className="inline-flex items-center gap-2.5 text-[18px] font-semibold tracking-[-0.035em]">
          <LogoMark size={30} fill="var(--ck-on-invert)" />
          <span>
            curhat<span className="opacity-75">ku</span>
          </span>
        </Link>
        <div>
          <h2 className="max-w-[14ch] text-[40px] font-semibold leading-[1.05] tracking-[-0.045em]">Semua perasaan layak punya tempat.</h2>
          <ul className="mt-8 flex flex-col gap-3 text-[14.5px]">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-3">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-on-invert/80" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[12px] opacity-70">Dalam keadaan darurat, hubungi 119 ext. 8 (layanan kesehatan jiwa).</p>
      </aside>
      <div id="konten" className="flex flex-col px-5 py-10 sm:px-10">
        <Link href="/" className="lg:hidden" aria-label="CurhatKu, ke halaman utama">
          <Wordmark size={28} />
        </Link>
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">{children}</div>
      </div>
    </div>
  );
}
