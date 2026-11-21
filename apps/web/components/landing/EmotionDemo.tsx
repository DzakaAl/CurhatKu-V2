"use client";

import { useState } from "react";
import { EMOTION_BG, type Emotion } from "@/lib/ml/emotions";
import { predictEmotion } from "@/lib/ml/model";
import { Icon } from "@/components/nav/icons";

const SAMPLES: [string, string][] = [
  ["sidang", "Besok sidang skripsi, dari semalam kepikiran terus dan susah tidur."],
  ["lega", "Akhirnya revisi disetujui! Lega banget, langsung traktir diri sendiri."],
  ["kangen", "Kangen rumah, tapi belum bisa pulang bulan ini."],
  ["kesal", "Kesal, teman kelompok lagi-lagi nggak mengerjakan bagiannya."],
];

type Result = [Emotion, number][];

/** Demo baca emosi di landing — memakai model yang sama dengan aplikasi, berjalan di browser. */
export default function EmotionDemo() {
  const [text, setText] = useState(SAMPLES[0][1]);
  const [res, setRes] = useState<Result | null>(null);
  const [state, setState] = useState<"idle" | "reading" | "error">("idle");

  async function run(t = text) {
    if (t.trim().length < 5) return;
    setState("reading");
    try {
      const r = await predictEmotion(t.trim());
      const dist = Object.entries(r.fullDistribution) as Result;
      const sum = dist.reduce((a, [, p]) => a + p, 0) || 1;
      setRes(dist.map(([e, p]) => [e, p / sum] as [Emotion, number]).sort((a, b) => b[1] - a[1]));
      setState("idle");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="grid items-start gap-12 md:grid-cols-2 md:gap-[72px]">
      <div>
        <p className="mb-4 text-[13px] font-semibold text-invert">Baca emosi</p>
        <h2 className="max-w-[17ch] text-[clamp(34px,4.6vw,60px)] font-semibold leading-[1.03] tracking-[-0.047em]">Tulis apa adanya. Lihat apa yang terbaca.</h2>
        <p className="mt-5 max-w-[44ch] text-[clamp(15.5px,1.25vw,17.5px)] text-ink-muted">
          Model kecil di browser-mu mengenali delapan emosi dasar. Ceritamu tidak dikirim ke server untuk dianalisis, dan hasilnya hanya perkiraan, bukan diagnosis.
        </p>
        <p className="mt-5 text-[14px] text-ink-muted">
          Coba contoh:{" "}
          {SAMPLES.map(([k, s], i) => (
            <span key={k}>
              {i ? " · " : ""}
              <button
                type="button"
                onClick={() => {
                  setText(s);
                  run(s);
                }}
                className="font-semibold text-invert underline decoration-invert/30 underline-offset-4 hover:decoration-invert"
              >
                {k}
              </button>
            </span>
          ))}
        </p>
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <label htmlFor="demo" className="text-[13px] font-semibold text-invert">
          Tulis satu kalimat
        </label>
        <textarea
          id="demo"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full resize-none border-0 border-b-[1.5px] border-line-strong bg-transparent pb-3.5 text-[clamp(20px,2vw,26px)] leading-[1.35] tracking-[-0.02em] outline-none focus:border-invert"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[12.5px] text-ink-muted">Contoh, tidak disimpan</span>
          <button type="button" onClick={() => run()} disabled={state === "reading"} className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-invert disabled:opacity-50">
            <Icon name="spark" className="h-4 w-4" />
            {state === "reading" ? "Membaca…" : "Baca emosi"}
          </button>
        </div>
        <div aria-live="polite" className="mt-4 min-h-[220px]">
          {state === "error" ? (
            <p className="text-ink-muted">Model belum bisa dimuat. Coba lagi sebentar.</p>
          ) : res ? (
            <>
              <div className="flex items-baseline gap-3.5">
                <b className="text-[clamp(40px,5vw,64px)] font-semibold leading-none tracking-[-0.05em]">{res[0][0]}</b>
                <span className="font-mono text-ink-muted">{Math.round(res[0][1] * 100)}%</span>
                <span className={`h-4 w-4 rounded-full ${EMOTION_BG[res[0][0]]}`} aria-hidden="true" />
              </div>
              <ul className="mt-5 flex flex-col gap-2">
                {res.slice(0, 5).map(([e, p]) => (
                  <li key={e} className="grid grid-cols-[76px_minmax(0,1fr)_40px] items-center gap-2.5 text-[12.5px]">
                    <span>{e}</span>
                    <span className="h-1.5 overflow-hidden rounded-full bg-surface-strong">
                      <span className={`block h-full rounded-full ${EMOTION_BG[e]}`} style={{ width: `${Math.round(p * 100)}%` }} />
                    </span>
                    <span className="text-right font-mono text-ink-muted">{Math.round(p * 100)}%</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-ink-muted">Tekan &ldquo;Baca emosi&rdquo; untuk melihat hasilnya.</p>
          )}
        </div>
      </div>
    </div>
  );
}
