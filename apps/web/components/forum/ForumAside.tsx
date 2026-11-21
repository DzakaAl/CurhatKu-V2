"use client";

import Link from "next/link";
import { useCategories } from "@/lib/api/hooks";

/** Kolom kanan forum: topik, aturan, ajakan ke psikolog (desktop lebar). */
export default function ForumAside({ onPick }: { onPick?: (slug: string) => void }) {
  const cats = useCategories();
  return (
    <aside className="sticky top-24 hidden flex-col gap-8 pt-4 xl:flex">
      <section>
        <h2 className="mb-1.5 text-[17px] font-semibold">Topik</h2>
        <ul>
          {cats.data?.map((c) => (
            <li key={c.slug} className="border-t border-line">
              {onPick ? (
                <button type="button" onClick={() => onPick(c.slug)} className="w-full py-3 text-left hover:text-invert">
                  <span className="block text-[12px] text-ink-muted">Topik</span>
                  <b className="font-semibold">#{c.name.replace(/\s|&/g, "")}</b>
                </button>
              ) : (
                <Link href="/forum" className="block py-3 hover:text-invert">
                  <span className="block text-[12px] text-ink-muted">Topik</span>
                  <b className="font-semibold">#{c.name.replace(/\s|&/g, "")}</b>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-[15px] font-semibold">Aturan ruang ini</h2>
        <ol className="mt-2 flex list-decimal flex-col gap-1.5 pl-[18px] text-[13.5px] text-ink-muted">
          <li>Dengarkan dulu, nasihat belakangan.</li>
          <li>Jangan membuka identitas siapa pun.</li>
          <li>Laporkan konten yang membahayakan.</li>
        </ol>
      </section>
      <section className="glow rounded-clay-lg bg-surface-strong p-5">
        <b className="block text-[15px]">Butuh bicara lebih dalam?</b>
        <p className="mt-1.5 text-[13.5px] text-ink-muted">Psikolog berlisensi siap mendengarkan.</p>
        <Link href="/konsultasi" className="mt-3 inline-flex min-h-9 items-center rounded-full bg-invert px-4 text-[13px] font-semibold text-on-invert hover:brightness-110">
          Lihat psikolog
        </Link>
      </section>
    </aside>
  );
}
