"use client";

import { useEffect, useState } from "react";

const FEEL = [
  "Capek tapi nggak tahu kenapa", "Takut mengecewakan orang tua", "Kangen rumah", "Overthinking jam 2 pagi",
  "Merasa tertinggal dari teman", "Lega akhirnya sidang selesai", "Bingung mau cerita ke siapa", "Burnout di kerjaan pertama",
  "Patah hati yang belum selesai", "Cemas sebelum presentasi", "Senang tapi takut kehilangan", "Pengin didengar, bukan dinasihati",
];
const DOTS = ["senang", "percaya", "sedih", "marah", "takut", "jijik", "terkejut", "waspada"];

/** Satu kalimat perasaan besar yang berganti; daftar di bawah bisa diketuk. */
export default function FeelCycle() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % FEEL.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <h2 aria-live="polite" className="mx-auto flex min-h-[2.2em] max-w-[16ch] flex-wrap items-center justify-center gap-[0.3em] text-[clamp(36px,6vw,80px)] font-semibold leading-[1.05] tracking-[-0.05em]">
        <span key={i} className="ck-up">{FEEL[i]}</span>
        <i aria-hidden="true" className="h-[0.32em] w-[0.32em] shrink-0 rounded-full" style={{ background: `var(--ck-mood-${DOTS[i % 8]})` }} />
      </h2>
      <p className="mx-auto mt-5 max-w-[46ch] text-center text-[clamp(15.5px,1.25vw,17.5px)] text-ink-muted">
        Tidak harus masalah besar. Hal kecil yang terus mengganjal juga layak ditulis, dan selalu ada yang mau mendengar.
      </p>
      <div className="mx-auto mt-12 flex max-w-[900px] flex-wrap justify-center gap-x-[18px] gap-y-1.5">
        {FEEL.map((f, j) => (
          <button
            key={f}
            type="button"
            onClick={() => setI(j)}
            aria-pressed={i === j}
            className={"border-b py-1 text-[14.5px] transition-colors " + (i === j ? "border-ink text-ink" : "border-transparent text-ink-muted/60 hover:text-ink-muted")}
          >
            {f}
          </button>
        ))}
      </div>
    </>
  );
}
