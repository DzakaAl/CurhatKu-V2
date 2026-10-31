"use client";

import Link from "next/link";
import Composer from "@/components/curhat/Composer";
import JournalRiver from "@/components/curhat/JournalRiver";
import MoodCheckin from "@/components/curhat/MoodCheckin";
import NotifBell from "@/components/nav/NotifBell";
import { ErrorBox, Skeleton } from "@/components/ui/States";
import { useDashboard, useJournals } from "@/lib/api/hooks";

const RECENT = 3;

/** Alur — tiga curhat terakhir mengalir ke kolom tulis. */
export default function AlurPage() {
  const dash = useDashboard();
  const journals = useJournals();
  const recent = journals.data?.slice(0, RECENT) ?? [];
  const streak = dash.data?.streak ?? 0;

  return (
    <main className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 font-extrabold">Alur minggumu</h1>
          <p className="mt-1 text-caption text-ink-muted">
            {dash.isPending ? "Memuat…" : streak ? `${streak} hari aktif berturut-turut` : "Mulai alurmu hari ini"}
          </p>
        </div>
        <NotifBell />
      </header>

      {journals.isPending ? (
        <Skeleton rows={2} />
      ) : journals.isError ? (
        <ErrorBox error={journals.error} onRetry={() => journals.refetch()} />
      ) : recent.length === 0 ? (
        <p className="max-w-[34ch] text-body text-ink-muted">
          Belum ada curhat. Tulisan pertamamu akan menjadi titik awal sungai ini, berwarna sesuai emosinya.
        </p>
      ) : (
        <section aria-label="Curhat terakhir" className="flex flex-col">
          {journals.data.length > RECENT ? (
            <Link
              href="/journal"
              className="mb-3 inline-flex min-h-11 w-fit items-center rounded-full px-3 -ml-3 text-caption font-semibold text-ink-muted hover:text-ink"
            >
              Lihat seluruh alur ({journals.data.length})
            </Link>
          ) : null}
          <JournalRiver journals={recent} open clamp />
        </section>
      )}

      <Composer />

      <section className="border-t border-line pt-5">
        <MoodCheckin today={dash.data?.todayMood} />
      </section>
    </main>
  );
}
