"use client";

import { EMOTIONS, EMOTION_BG, type Emotion } from "@/lib/ml/emotions";
import { useCheckin } from "@/lib/api/hooks";

/** Check-in mood harian: 8 chip emosi, satu pilihan per hari (bisa diganti). */
export default function MoodCheckin({ today }: { today: Emotion | null | undefined }) {
  const checkin = useCheckin();
  const current = checkin.isPending ? checkin.variables : today;

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-[13px] font-semibold">
        Mood hari ini{" "}
        <span className="font-normal text-ink-muted">{current ? `· ${current}, ketuk untuk mengganti` : "· satu kata cukup"}</span>
      </legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {EMOTIONS.map((e) => {
          const on = current === e;
          return (
            <button
              key={e}
              type="button"
              aria-pressed={on}
              onClick={() => checkin.mutate(e)}
              className={
                "flex min-h-11 items-center gap-2.5 rounded-[12px] border px-3 text-left text-[13px] transition-[transform,background-color,border-color] active:scale-[0.98] " +
                (on ? "border-ink bg-surface-strong font-semibold" : "border-line font-medium hover:bg-surface-strong/60")
              }
            >
              <span aria-hidden="true" className={`h-3 w-3 shrink-0 rounded-full ${EMOTION_BG[e]}`} />
              {e}
            </button>
          );
        })}
      </div>
      {checkin.isError ? (
        <p role="alert" className="text-caption font-medium text-danger">
          Mood belum tersimpan. Coba ketuk lagi.
        </p>
      ) : null}
    </fieldset>
  );
}
