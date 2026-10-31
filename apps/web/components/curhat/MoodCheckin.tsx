"use client";

import { EMOTIONS, EMOTION_BG, type Emotion } from "@/lib/ml/emotions";
import { useCheckin } from "@/lib/api/hooks";

/** Check-in mood harian: 8 chip emosi, satu pilihan per hari (bisa diganti). */
export default function MoodCheckin({ today }: { today: Emotion | null | undefined }) {
  const checkin = useCheckin();
  const current = checkin.isPending ? checkin.variables : today;

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-caption font-medium text-ink-muted">
        {current ? `Mood hari ini: ${current}. Ketuk untuk mengganti.` : "Satu kata untuk hari ini?"}
      </legend>
      <div className="flex flex-wrap gap-2">
        {EMOTIONS.map((e) => {
          const on = current === e;
          return (
            <button
              key={e}
              type="button"
              aria-pressed={on}
              onClick={() => checkin.mutate(e)}
              className={
                "min-h-11 rounded-full px-4 text-caption font-semibold transition-[transform,background-color] active:scale-95 " +
                (on ? `${EMOTION_BG[e]} text-night` : "bg-surface text-ink hover:bg-surface-strong")
              }
            >
              {e}
            </button>
          );
        })}
      </div>
      {checkin.isError ? (
        <p role="alert" className="text-caption font-medium text-[#b42318] dark:text-mood-marah">
          Mood belum tersimpan. Coba ketuk lagi.
        </p>
      ) : null}
    </fieldset>
  );
}
