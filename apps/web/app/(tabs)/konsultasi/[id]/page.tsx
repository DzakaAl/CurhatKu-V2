"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Initials, KV } from "@/components/ui/Kit";
import { ErrorBox, Skeleton, formatSlot, rupiah } from "@/components/ui/States";
import { useBook, usePsychologist } from "@/lib/api/hooks";

const DAY = new Intl.DateTimeFormat("id-ID", { weekday: "short", day: "numeric", month: "short" });

/** Profil psikolog + pilih jadwal per hari → ringkasan → booking. */
export default function PsychologistPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number(use(params).id);
  const router = useRouter();
  const psy = usePsychologist(id);
  const book = useBook();
  const [slot, setSlot] = useState<number | null>(null);

  if (psy.isPending) return <Skeleton rows={3} />;
  if (psy.isError) return <ErrorBox error={psy.error} onRetry={() => psy.refetch()} />;
  const p = psy.data;

  const days = new Map<string, { id: number; startsAt: string }[]>();
  p.slots?.forEach((s) => {
    const d = s.startsAt.slice(0, 10);
    days.set(d, [...(days.get(d) ?? []), s]);
  });
  const chosen = p.slots?.find((s) => s.id === slot);

  return (
    <main className="grid items-start gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-6">
        <section className="flex items-start gap-4">
          <Initials name={p.name} size={56} accent />
          <div className="min-w-0">
            <h1 className="text-[clamp(22px,2.6vw,26px)] font-semibold tracking-[-0.035em]">{p.name}</h1>
            <p className="text-ink-muted">{p.title}</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {p.specialties.map((s) => (
                <span key={s} className="rounded-full bg-surface-strong px-2.5 py-0.5 text-[11.5px] font-medium text-ink-soft">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </section>
        <p className="max-w-[66ch] border-t border-line pt-5 leading-relaxed text-ink-soft">{p.bio}</p>

        <fieldset className="flex flex-col gap-5 border-t border-line pt-5">
          <legend className="sr-only">Pilih jadwal</legend>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold">Pilih jadwal</span>
            <span className="text-[12px] text-ink-muted">Waktu Indonesia Barat</span>
          </div>
          {days.size === 0 ? (
            <p className="text-ink-muted">Belum ada jadwal kosong minggu ini.</p>
          ) : (
            [...days.entries()].map(([d, slots]) => (
              <div key={d} className="flex flex-col gap-2">
                <b className="text-[13px] font-semibold">{DAY.format(new Date(d + "T12:00:00"))}</b>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-2">
                  {slots.map((s) => (
                    <label
                      key={s.id}
                      className={
                        "flex min-h-11 cursor-pointer items-center justify-center rounded-[12px] border font-mono text-[13px] font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-invert " +
                        (slot === s.id ? "border-invert bg-invert text-on-invert" : "border-line-strong hover:bg-surface-strong")
                      }
                    >
                      <input type="radio" name="slot" value={s.id} checked={slot === s.id} onChange={() => setSlot(s.id)} className="sr-only" />
                      {s.startsAt.slice(11, 16).replace(":", ".")}
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}
        </fieldset>
      </div>

      <Card className="sticky bottom-24 flex flex-col gap-4 xl:top-24 xl:bottom-auto">
        <p className="text-[13px] font-semibold">Ringkasan</p>
        <KV
          rows={[
            ["Psikolog", p.name.replace(/,.*$/, "")],
            ["Jadwal", chosen ? formatSlot(chosen.startsAt) : <span className="font-normal text-ink-muted">Belum dipilih</span>],
            ["Durasi", "50 menit"],
            ["Biaya", <span key="b" className="font-mono">{rupiah(p.price)}</span>],
          ]}
        />
        {book.isError ? <ErrorBox error={book.error} /> : null}
        <Button size="lg" disabled={!slot || book.isPending} onClick={() => slot && book.mutate(slot, { onSuccess: (b) => router.push(`/konsultasi/booking/${b.id}`) })}>
          {book.isPending ? "Memesan…" : "Pesan sesi"}
        </Button>
        <p className="text-center text-[12px] text-ink-muted">Kamu akan diminta transfer dan mengunggah bukti setelah memesan.</p>
      </Card>
    </main>
  );
}
