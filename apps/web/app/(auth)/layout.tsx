import type { ReactNode } from "react";

/** Layout halaman auth — kolom tunggal, tanpa navigasi tab. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div id="konten" className="mx-auto flex min-h-dvh w-full max-w-clay flex-col px-5 pb-10 pt-12">
      <span className="text-[18px] font-extrabold tracking-[-0.03em]">curhatku</span>
      <div className="mt-14 flex flex-1 flex-col">{children}</div>
    </div>
  );
}
