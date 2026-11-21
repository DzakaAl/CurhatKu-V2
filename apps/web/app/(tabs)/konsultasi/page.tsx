"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/nav/icons";
import { Chip, Initials, scrollRow } from "@/components/ui/Kit";
import { ErrorBox, PageHeader, SectionHead, Skeleton, formatSlot, rupiah } from "@/components/ui/States";
import { useBookings, useMe, usePsychologists } from "@/lib/api/hooks";
import { STATUS_STYLE } from "@/lib/api/status";

/** Konsultasi — sesi saya + daftar psikolog dengan filter keahlian. */
export default function KonsultasiPage() {
  const me = useMe();
  const bookings = useBookings();
  const psys = usePsychologists();
  const isPsy = me.data?.role === "psychologist";
  const [spec, setSpec] = useState<string | null>(null);
  const specs = [...new Set(psys.data?.flatMap((p) => p.specialties) ?? [])];
  const list = psys.data?.filter((p) => !spec || p.specialties.includes(spec)) ?? [];

  return (
    <main className="flex flex-col gap-8">
      <PageHeader title="Psikolog" subtitle="Bicara dengan psikolog berlisensi. Bayar per sesi, chat terbuka setelah pembayaran terkonfirmasi." />

      {bookings.data?.length ? (
        <section aria-labelledby="sesi" className="flex flex-col gap-2">
          <SectionHead id="sesi" title={isPsy ? "Sesi klien" : "Sesi kamu"} />
          <ul>
            {bookings.data.map((b) => (
              <li key={b.id}>
                <Link href={`/konsultasi/booking/${b.id}`} className="-mx-3 flex items-center gap-3 rounded-[14px] px-3 py-3.5 hover:bg-surface-strong/50">
                  <Initials name={isPsy ? b.client : b.psychologist.name} size={40} accent />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{isPsy ? b.client : b.psychologist.name}</span>
                    <span className="flex items-center gap-1.5 text-[12.5px] text-ink-muted">
                      {formatSlot(b.startsAt)} · <span className="font-mono">#{b.id}</span>
                    </span>
                  </span>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${STATUS_STYLE[b.status]}`}>{b.statusLabel}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!isPsy ? (
        <section aria-labelledby="psikolog" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
            <h2 id="psikolog" className="text-[13px] font-semibold">
              Pilih psikolog
            </h2>
          </div>
          {specs.length > 1 ? (
            <div className={scrollRow} role="group" aria-label="Filter keahlian">
              <Chip on={!spec} onClick={() => setSpec(null)}>
                Semua
              </Chip>
              {specs.map((s) => (
                <Chip key={s} on={spec === s} onClick={() => setSpec(s)}>
                  {s}
                </Chip>
              ))}
            </div>
          ) : null}
          {psys.isPending ? (
            <Skeleton rows={2} />
          ) : psys.isError ? (
            <ErrorBox error={psys.error} onRetry={() => psys.refetch()} />
          ) : (
            <ul className="grid gap-x-8 md:grid-cols-2">
              {list.map((p) => (
                <li key={p.id} className="border-t border-line">
                  <Link href={`/konsultasi/${p.id}`} className="group flex h-full flex-col gap-3.5 py-5">
                    <span className="flex items-start gap-3">
                      <Initials name={p.name} size={52} accent />
                      <span className="min-w-0">
                        <span className="block text-[15px] font-semibold group-hover:text-invert">{p.name}</span>
                        <span className="block text-[12.5px] text-ink-muted">{p.title}</span>
                      </span>
                    </span>
                    <span className="flex flex-wrap gap-1.5">
                      {p.specialties.map((s) => (
                        <span key={s} className="rounded-full bg-surface-strong px-2.5 py-0.5 text-[11.5px] font-medium text-ink-soft">
                          {s}
                        </span>
                      ))}
                    </span>
                    <span className="mt-auto flex items-center justify-between border-t border-line pt-3">
                      <span>
                        <b className="font-mono font-medium">{rupiah(p.price)}</b> <span className="text-[12px] text-ink-muted">/ sesi</span>
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[12.5px] font-semibold text-invert">
                        Jadwal
                        <Icon name="chev" className="h-3.5 w-3.5" />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <p className="text-caption text-ink-muted">
        Dalam keadaan darurat atau ada pikiran menyakiti diri, segera hubungi <strong className="text-ink">112</strong> atau 119 ext. 8.
      </p>
    </main>
  );
}
