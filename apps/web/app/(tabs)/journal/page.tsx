"use client";

import Link from "next/link";
import { useState } from "react";
import EmptyState from "@/components/curhat/EmptyState";
import JournalTimeline from "@/components/curhat/JournalTimeline";
import { Icon } from "@/components/nav/icons";
import { Chip, Dot, scrollRow } from "@/components/ui/Kit";
import { ErrorBox, PageHeader, Skeleton } from "@/components/ui/States";
import { useJournals } from "@/lib/api/hooks";
import { parseSql } from "@/lib/date";
import { EMOTIONS, EMOTION_BG, type Emotion } from "@/lib/ml/emotions";

/** Jurnal: sebaran emosi 7 hari, filter emosi, linimasa per hari. */
export default function JurnalPage() {
  const journals = useJournals();
  const [filter, setFilter] = useState<Emotion | null>(null);
  const [now] = useState(() => Date.now());
  const all = journals.data ?? [];
  const week = all.filter((j) => now - parseSql(j.createdAt).getTime() < 7 * 86_400_000);
  const counts = EMOTIONS.map((e) => [e, week.filter((j) => j.emotion === e).length] as const).filter(([, n]) => n > 0);
  const list = filter ? all.filter((j) => j.emotion === filter) : all;

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Jurnal"
        subtitle="Semua curhatmu tersusun per hari. Warna titik menunjukkan emosi yang terbaca."
        action={
          <Link href="/dashboard#tulis" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-invert px-4 text-[13.5px] font-semibold text-on-invert hover:brightness-110">
            <Icon name="pen" className="h-4 w-4" />
            Tulis curhat
          </Link>
        }
      />

      {counts.length ? (
        <section aria-labelledby="sebaran" className="border-t border-line pt-5">
          <h2 id="sebaran" className="mb-3 text-[13px] font-semibold">
            Sebaran emosi · 7 hari
          </h2>
          <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full">
            {counts.map(([e, n]) => (
              <span key={e} className={EMOTION_BG[e]} style={{ flex: n }} title={e} />
            ))}
          </div>
          <p className="mt-3 flex flex-wrap gap-x-3.5 gap-y-1.5 text-[12px]">
            {counts.map(([e, n]) => (
              <span key={e} className="inline-flex items-center gap-1.5">
                <Dot e={e} size={8} />
                {e} <b className="font-mono font-medium">{n}</b>
              </span>
            ))}
          </p>
        </section>
      ) : null}

      <div className={scrollRow} role="group" aria-label="Filter emosi">
        <Chip on={!filter} onClick={() => setFilter(null)}>
          Semua
        </Chip>
        {EMOTIONS.map((e) => (
          <Chip key={e} on={filter === e} onClick={() => setFilter(e)}>
            <Dot e={e} size={8} />
            {e}
          </Chip>
        ))}
      </div>

      {journals.isPending ? (
        <Skeleton />
      ) : journals.isError ? (
        <ErrorBox error={journals.error} onRetry={() => journals.refetch()} />
      ) : all.length === 0 ? (
        <EmptyState title="Jurnalmu masih kosong" body="Tulis curhat pertamamu. Setiap tulisan menjadi titik berwarna di sini." action={{ href: "/dashboard#tulis", label: "Mulai menulis" }} />
      ) : list.length === 0 ? (
        <EmptyState title="Belum ada curhat dengan emosi ini" body="Coba pilih emosi lain, atau tampilkan semua." />
      ) : (
        <JournalTimeline journals={list} />
      )}
    </main>
  );
}
