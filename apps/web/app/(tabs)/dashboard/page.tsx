"use client";

import Link from "next/link";
import { useState } from "react";
import Composer from "@/components/curhat/Composer";
import JournalList from "@/components/curhat/JournalList";
import MoodCheckin from "@/components/curhat/MoodCheckin";
import WeekGrid from "@/components/curhat/WeekGrid";
import { Initials } from "@/components/ui/Kit";
import { STATUS_STYLE } from "@/lib/api/status";
import { ErrorBox, SectionHead, Skeleton, formatSlot } from "@/components/ui/States";
import { useArticles, useBookings, useDashboard, useJournals, useMe } from "@/lib/api/hooks";
import { parseSql } from "@/lib/date";

const RECENT = 3;
const TODAY = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long" });

/** Beranda: sapaan, check-in mood, tulis curhat, curhat terakhir; ringkasan minggu di samping. */
export default function BerandaPage() {
  const me = useMe();
  const dash = useDashboard();
  const journals = useJournals();
  const recent = journals.data?.slice(0, RECENT) ?? [];
  const streak = dash.data?.streak ?? 0;
  const bookings = useBookings();
  const [now] = useState(() => Date.now());
  const articles = useArticles();
  const next = bookings.data
    ?.filter((b) => b.status !== "cancelled" && parseSql(b.startsAt).getTime() > now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
  const read = articles.data?.find((a) => !a.read) ?? articles.data?.[0];

  return (
    <main className="grid items-start gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-6">
        <header className="glow rounded-clay-xl bg-surface p-6 shadow-[0_0_0_1px_var(--ck-line)] md:p-8">
          <p className="text-[13px] font-semibold text-ink-soft">{TODAY.format(now)}</p>
          <h1 className="mt-1.5 text-[clamp(26px,3.4vw,34px)] font-semibold tracking-[-0.04em]">
            Hai{me.data ? ` ${me.data.name}` : ""}, apa kabar hari ini?
          </h1>
          <p className="mt-1 text-ink-muted">
            {dash.isPending ? "Memuat…" : streak ? `${streak} hari berturut-turut kamu menyempatkan bercerita.` : "Mulai dari satu kalimat hari ini."}
          </p>
        </header>

        <section className="border-t border-line pt-5">
          <MoodCheckin today={dash.data?.todayMood} />
        </section>

        <div id="tulis" className="scroll-mt-24">
          <Composer />
        </div>

        <section aria-labelledby="terakhir" className="flex flex-col gap-4">
          <SectionHead
            id="terakhir"
            title="Curhat terakhir"
            right={
              journals.data?.length ? (
                <Link href="/journal" className="text-[12.5px] font-semibold text-invert hover:underline">
                  Lihat semua ({journals.data.length})
                </Link>
              ) : null
            }
          />
          {journals.isPending ? (
            <Skeleton rows={2} />
          ) : journals.isError ? (
            <ErrorBox error={journals.error} onRetry={() => journals.refetch()} />
          ) : recent.length === 0 ? (
            <p className="max-w-[40ch] text-ink-muted">Belum ada curhat. Tulisan pertamamu akan menjadi titik awal sungai emosimu.</p>
          ) : (
            <JournalList journals={recent} />
          )}
        </section>
      </div>

      <aside className="flex flex-col gap-6 xl:sticky xl:top-24">
        <section aria-labelledby="minggu" className="flex flex-col gap-4">
          <SectionHead id="minggu" title="Minggu ini" />
          <WeekGrid week={dash.data?.week} />
          <div className="grid grid-cols-2 border-t border-line">
            <div className="py-3.5">
              <b className="block font-mono text-[26px] font-medium tracking-[-0.03em]">{streak}</b>
              <span className="text-[12px] text-ink-muted">hari beruntun</span>
            </div>
            <div className="border-l border-line py-3.5 pl-4">
              <b className="block font-mono text-[26px] font-medium tracking-[-0.03em]">{dash.data?.journalCount ?? 0}</b>
              <span className="text-[12px] text-ink-muted">total curhat</span>
            </div>
          </div>
        </section>
        {next ? (
          <section aria-labelledby="sesi" className="flex flex-col gap-4">
            <SectionHead id="sesi" title="Sesi berikutnya" right={<span className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${STATUS_STYLE[next.status]}`}>{next.statusLabel}</span>} />
            <div className="flex items-center gap-3">
              <Initials name={next.psychologist.name} size={36} accent />
              <div className="min-w-0">
                <b className="block truncate text-[13.5px] font-semibold">{next.psychologist.name}</b>
                <span className="text-[12px] text-ink-muted">{formatSlot(next.startsAt)}</span>
              </div>
            </div>
            <Link href={`/konsultasi/booking/${next.id}`} className="inline-flex min-h-9 items-center justify-center rounded-full border border-line-strong text-[13px] font-semibold hover:bg-surface-strong">
              Lihat sesi
            </Link>
          </section>
        ) : (
          <section className="glow rounded-clay-lg bg-surface-strong p-5">
            <b className="block text-[15px]">Butuh bicara lebih dalam?</b>
            <p className="mt-1.5 text-[13.5px] text-ink-muted">Psikolog berlisensi siap mendengarkan. Bayar per sesi, chat setelah terkonfirmasi.</p>
            <Link href="/konsultasi" className="mt-3 inline-flex min-h-9 items-center rounded-full bg-invert px-4 text-[13px] font-semibold text-on-invert hover:brightness-110">
              Lihat psikolog
            </Link>
          </section>
        )}
        {read ? (
          <section aria-labelledby="bacaan" className="flex flex-col gap-3">
            <SectionHead id="bacaan" title="Bacaan untukmu" />
            <Link href={`/artikel/${read.slug}`} className="group">
              <b className="block font-semibold group-hover:text-invert">{read.title}</b>
              <span className="text-[12px] text-ink-muted">{read.readMinutes} menit baca</span>
            </Link>
          </section>
        ) : null}
      </aside>
    </main>
  );
}
