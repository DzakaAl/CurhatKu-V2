import type { ReactNode } from "react";

/** Layout halaman auth — kolom tunggal, tanpa navigasi tab. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div id="konten" className="mx-auto flex min-h-dvh w-full max-w-clay flex-col px-5 pb-10 pt-12">
      <span className="flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG statis kecil */}
        <img src="/logo.svg" alt="" width={32} height={32} className="h-8 w-8" />
        <span className="font-display text-[22px] font-semibold tracking-[-0.02em]">CurhatKu</span>
      </span>
      <div className="mt-14 flex flex-1 flex-col">{children}</div>
    </div>
  );
}
