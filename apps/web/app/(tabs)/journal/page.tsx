"use client";

import EmptyState from "@/components/curhat/EmptyState";
import JournalRiver from "@/components/curhat/JournalRiver";
import WeekStrip from "@/components/curhat/WeekStrip";
import { ErrorBox, PageHeader, Skeleton } from "@/components/ui/States";
import { useDashboard, useJournals } from "@/lib/api/hooks";

/** Seluruh alur — semua curhat, dari yang paling lama. */
export default function SeluruhAlurPage() {
  const journals = useJournals();
  const dash = useDashboard();

  return (
    <main className="flex flex-col gap-6">
      <PageHeader title="Seluruh alur" back="/dashboard" />

      <section aria-labelledby="minggu" className="flex flex-col gap-3">
        <h2 id="minggu" className="text-caption font-medium text-ink-muted">
          Warna 7 hari terakhir
        </h2>
        <WeekStrip week={dash.data?.week} size="lg" />
      </section>

      {journals.isPending ? (
        <Skeleton />
      ) : journals.isError ? (
        <ErrorBox error={journals.error} onRetry={() => journals.refetch()} />
      ) : journals.data.length === 0 ? (
        <EmptyState
          title="Alurmu masih kosong"
          body="Tulis curhat pertamamu. Setiap tulisan menjadi titik berwarna di sungai ini."
          action={{ href: "/dashboard", label: "Mulai menulis" }}
        />
      ) : (
        <JournalRiver journals={journals.data} />
      )}
    </main>
  );
}
