"use client";

import { EMOTION_BG, type Emotion } from "@/lib/ml/emotions";

const DAY = new Intl.DateTimeFormat("id-ID", { weekday: "long" });

type Day = { date: string; emotion: Emotion | null };

/** Tujuh batang = emosi tujuh hari terakhir. Abu = belum ada catatan. */
export default function WeekStrip({ week, size = "sm" }: { week?: Day[]; size?: "sm" | "lg" }) {
  const days: Day[] = week ?? Array.from({ length: 7 }, (_, i) => ({ date: String(i), emotion: null }));
  const summary = week
    ? days.map((d) => `${DAY.format(new Date(d.date))}: ${d.emotion ?? "belum ada catatan"}`).join(", ")
    : "memuat";

  return (
    <ol
      aria-label={`Emosi 7 hari terakhir. ${summary}`}
      className={"flex items-end " + (size === "lg" ? "gap-2" : "gap-1")}
    >
      {days.map((d) => (
        <li
          key={d.date}
          aria-hidden="true"
          className={
            (size === "lg" ? "h-16 flex-1 rounded-clay-sm " : "h-[22px] w-2.5 rounded ") +
            (d.emotion ? EMOTION_BG[d.emotion] : "bg-mood-none") +
            (week ? "" : " animate-pulse")
          }
        />
      ))}
    </ol>
  );
}
