"use client";

import { useState } from "react";
import Composer from "./Composer";
import { Dot } from "@/components/ui/Kit";
import { dayKey, dayLabel, timeLabel } from "@/lib/date";
import { useDeleteJournal } from "@/lib/api/hooks";
import type { Journal } from "@/lib/api/types";

/** Jurnal per hari: jam di kiri, titik emosi di garis waktu, isi + aksi ubah/hapus. */
export default function JournalTimeline({ journals }: { journals: Journal[] }) {
  const del = useDeleteJournal();
  const [editing, setEditing] = useState<number | null>(null);
  const [confirming, setConfirming] = useState<number | null>(null);

  const groups = new Map<string, Journal[]>();
  journals.forEach((j) => {
    const k = dayKey(j.createdAt);
    groups.set(k, [...(groups.get(k) ?? []), j]);
  });

  return (
    <div className="flex flex-col gap-2">
      {[...groups.values()].map((js) => (
        <section key={dayKey(js[0].createdAt)} className="border-t border-line">
          <div className="flex items-center justify-between pb-4 pt-5">
            <h2 className="text-[13px] font-semibold">{dayLabel(js[0].createdAt)}</h2>
            <span className="text-[12px] text-ink-muted">{js.length} curhat</span>
          </div>
          <ol>
            {js.map((j, i) => (
              <li key={j.id} className="grid grid-cols-[44px_14px_minmax(0,1fr)] gap-2.5 pb-5 sm:grid-cols-[64px_18px_minmax(0,1fr)] sm:gap-3">
                <time className="pt-0.5 text-right font-mono text-[12px] text-ink-muted">{timeLabel(j.createdAt)}</time>
                <span className="relative flex justify-center">
                  {i < js.length - 1 ? <span aria-hidden="true" className="absolute -bottom-5 top-[18px] w-px bg-line-strong" /> : null}
                  <Dot e={j.emotion} size={12} className="mt-1 ring-4 ring-bg" />
                </span>
                <div className="min-w-0">
                  {editing === j.id ? (
                    <Composer journal={j} autoFocus onDone={() => setEditing(null)} />
                  ) : (
                    <>
                      <b className="font-semibold">{j.emotion ?? "Emosi belum jelas"}</b>
                      <p className="mt-0.5 whitespace-pre-line text-ink-muted">{j.content}</p>
                      <div className="-ml-2.5 mt-1 flex flex-wrap items-center text-[12.5px] font-medium text-ink-muted">
                        {confirming === j.id ? (
                          <>
                            <span className="px-2.5">Hapus curhat ini?</span>
                            <button type="button" onClick={() => del.mutate(j.id, { onSettled: () => setConfirming(null) })} className="min-h-9 rounded-full px-2.5 font-semibold text-danger hover:bg-danger-soft">
                              Ya, hapus
                            </button>
                            <button type="button" onClick={() => setConfirming(null)} className="min-h-9 rounded-full px-2.5 hover:bg-surface-strong">
                              Batal
                            </button>
                          </>
                        ) : (
                          <>
                            <button type="button" onClick={() => setEditing(j.id)} className="min-h-9 rounded-full px-2.5 hover:bg-surface-strong hover:text-ink">
                              Ubah
                            </button>
                            <button type="button" onClick={() => setConfirming(j.id)} className="min-h-9 rounded-full px-2.5 hover:bg-surface-strong hover:text-ink">
                              Hapus
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
