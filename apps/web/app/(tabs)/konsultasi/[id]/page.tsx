"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { ErrorBox, PageHeader, Skeleton, formatSlot, rupiah } from "@/components/ui/States";
import { useBook, usePsychologist } from "@/lib/api/hooks";

/** Profil psikolog + pilih jadwal → booking. */
export default function PsychologistPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number(use(params).id);
  const router = useRouter();
  const psy = usePsychologist(id);
  const book = useBook();
  const [slot, setSlot] = useState<number | null>(null);

  if (psy.isPending) return <Skeleton rows={3} />;
  if (psy.isError) return <ErrorBox error={psy.error} onRetry={() => psy.refetch()} />;
  const p = psy.data;

  // Kelompokkan slot per hari.
  const days = new Map<string, { id: number; startsAt: string }[]>();
  p.slots?.forEach((s) => {
    const d = s.startsAt.slice(0, 10);
    days.set(d, [...(days.get(d) ?? []), s]);
  });
  const DAY = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "short" });

  return (
    <main className="flex flex-col gap-6">
      <PageHeader title={p.name} back="/konsultasi" />
      <div className="flex flex-col gap-2">
        <p className="text-caption text-ink-muted">{p.title}</p>
        <p className="leading-relaxed">{p.bio}</p>
        <p className="font-semibold">{rupiah(p.price)} per sesi · 50 menit</p>
      </div>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-h3 font-semibold tracking-[-0.02em]">Pilih jadwal</legend>
        {days.size === 0 ? (
          <p className="text-ink-muted">Belum ada jadwal kosong minggu ini.</p>
        ) : (
          [...days.entries()].map(([d, slots]) => (
            <div key={d} className="flex flex-col gap-2">
              <p className="text-caption font-medium text-ink-muted">{DAY.format(new Date(d))}</p>
              <div className="flex flex-wrap gap-2">
                {slots.map((s) => (
                  <label
                    key={s.id}
                    className={
                      "flex min-h-11 cursor-pointer items-center rounded-full px-4 font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ink " +
                      (slot === s.id ? "bg-invert text-on-invert" : "bg-surface hover:bg-surface-strong")
                    }
                  >
                    <input
                      type="radio"
                      name="slot"
                      value={s.id}
                      checked={slot === s.id}
                      onChange={() => setSlot(s.id)}
                      className="sr-only"
                    />
                    {s.startsAt.slice(11, 16)}
                  </label>
                ))}
              </div>
            </div>
          ))
        )}
      </fieldset>

      {book.isError ? <ErrorBox error={book.error} /> : null}

      <div className="sticky bottom-28 flex flex-col gap-2 rounded-clay-lg border border-line bg-surface p-4">
        <p className="text-caption text-ink-muted">
          {slot ? formatSlot(p.slots!.find((s) => s.id === slot)!.startsAt) : "Belum ada jadwal dipilih"}
        </p>
        <Button
          size="lg"
          disabled={!slot || book.isPending}
          onClick={() => slot && book.mutate(slot, { onSuccess: (b) => router.push(`/konsultasi/booking/${b.id}`) })}
        >
          {book.isPending ? "Memesan…" : "Pesan sesi"}
        </Button>
      </div>
    </main>
  );
}
