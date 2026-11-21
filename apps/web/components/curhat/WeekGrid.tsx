"use client";

import { Dot } from "@/components/ui/Kit";
import type { Emotion } from "@/lib/ml/emotions";

const WD = new Intl.DateTimeFormat("id-ID", { weekday: "narrow" });
const LONG = new Intl.DateTimeFormat("id-ID", { weekday: "long" });
const KEY = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" });

/** Tujuh hari: huruf hari, tanggal, titik warna emosi. Hari ini disorot. */
export default function WeekGrid({ week }: { week?: { date: string; emotion: Emotion | null }[] }) {
  const today = KEY.format(new Date());
  const days = week ?? Array.from({ length: 7 }, (_, i) => ({ date: `x${i}`, emotion: null }));
  return (
    <ol
      aria-label={week ? "Emosi 7 hari terakhir. " + week.map((d) => `${LONG.format(new Date(d.date))}: ${d.emotion ?? "belum ada catatan"}`).join(", ") : "Memuat"}
      className="grid grid-cols-7 gap-1.5"
    >
      {days.map((d) => {
        const real = !d.date.startsWith("x");
        const dt = real ? new Date(d.date + "T12:00:00") : null;
        return (
          <li
            key={d.date}
            aria-hidden="true"
            className={"flex flex-col items-center gap-1.5 rounded-[12px] py-2.5 text-[11.5px] text-ink-muted " + (d.date === today ? "bg-surface-strong" : "")}
          >
            <span>{dt ? WD.format(dt) : "·"}</span>
            <b className="text-[14px] font-semibold text-ink">{dt ? dt.getDate() : ""}</b>
            {d.emotion ? <Dot e={d.emotion} size={8} /> : <span className="mt-0.5 h-1 w-1 rounded-full bg-line-strong" />}
          </li>
        );
      })}
    </ol>
  );
}
