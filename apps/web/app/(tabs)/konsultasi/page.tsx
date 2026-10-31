"use client";

import Link from "next/link";
import { ErrorBox, PageHeader, Skeleton, formatSlot, rupiah } from "@/components/ui/States";
import { useBookings, useMe, usePsychologists } from "@/lib/api/hooks";
import { STATUS_STYLE } from "@/lib/api/status";

/** Konsultasi — sesi saya + daftar psikolog. */
export default function KonsultasiPage() {
  const me = useMe();
  const bookings = useBookings();
  const psys = usePsychologists();
  const isPsy = me.data?.role === "psychologist";

  return (
    <main className="flex flex-col gap-8">
      <PageHeader title="Psikolog" subtitle="Bicara dengan psikolog berlisensi. Bayar per sesi, chat setelah terkonfirmasi." />

      {bookings.data?.length ? (
        <section aria-labelledby="sesi" className="flex flex-col gap-3">
          <h2 id="sesi" className="text-h3 font-semibold tracking-[-0.02em]">
            {isPsy ? "Sesi klien" : "Sesi kamu"}
          </h2>
          <ul className="flex flex-col gap-2">
            {bookings.data.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/konsultasi/booking/${b.id}`}
                  className="flex items-center justify-between gap-3 rounded-clay-lg bg-surface p-4 transition-colors hover:bg-surface-strong"
                >
                  <span className="min-w-0">
                    <span className="block font-semibold">{isPsy ? b.client : b.psychologist.name}</span>
                    <span className="block text-caption text-ink-muted">{formatSlot(b.startsAt)}</span>
                  </span>
                  <span className={`shrink-0 rounded-full px-3 py-1.5 text-label font-semibold ${STATUS_STYLE[b.status]}`}>
                    {b.statusLabel}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!isPsy ? (
        <section aria-labelledby="psikolog" className="flex flex-col gap-3">
          <h2 id="psikolog" className="text-h3 font-semibold tracking-[-0.02em]">
            Pilih psikolog
          </h2>
          {psys.isPending ? (
            <Skeleton rows={2} />
          ) : psys.isError ? (
            <ErrorBox error={psys.error} onRetry={() => psys.refetch()} />
          ) : (
            <ul className="flex flex-col gap-3">
              {psys.data.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/konsultasi/${p.id}`}
                    className="flex flex-col gap-2 rounded-clay-lg bg-surface p-5 transition-colors hover:bg-surface-strong"
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span>
                        <span className="block text-h3 font-semibold tracking-[-0.02em]">{p.name}</span>
                        <span className="block text-caption text-ink-muted">{p.title}</span>
                      </span>
                      <span className="shrink-0 font-semibold">{rupiah(p.price)}</span>
                    </span>
                    <span className="flex flex-wrap gap-1.5">
                      {p.specialties.map((s) => (
                        <span key={s} className="rounded-full bg-bg px-2.5 py-1 text-label font-medium">
                          {s}
                        </span>
                      ))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <p className="text-caption text-ink-muted">
        Dalam keadaan darurat atau ada pikiran menyakiti diri, segera hubungi <strong className="text-ink">112</strong>.
      </p>
    </main>
  );
}
