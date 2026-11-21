"use client";

import { useEffect, useId, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { EMOTION_BG, EMOTION_HEX, type Emotion } from "@/lib/ml/emotions";
import { Icon } from "@/components/nav/icons";
import { predictEmotion } from "@/lib/ml/model";
import { useSaveJournal } from "@/lib/api/hooks";
import { ApiError } from "@/lib/api/client";
import type { Journal } from "@/lib/api/types";

gsap.registerPlugin(useGSAP);

type Detect =
  | { kind: "empty" }
  | { kind: "reading" }
  | {
      kind: "result";
      emotion: Emotion;
      confidence: number;
      emotion2: Emotion;
      confidence2: number;
      uncertain: boolean;
      dist: [Emotion, number][];
    }
  | { kind: "error" };

const MIN_CHARS = 12;
const lineColor = () => getComputedStyle(document.documentElement).getPropertyValue("--ck-line").trim();
const DEBOUNCE_MS = 700;

/**
 * Kolom curhat + deteksi emosi langsung (TF.js di perangkat). Bar bawah
 * berganti warna mengikuti emosi — satu-satunya sumber warna di antarmuka.
 * Dengan `journal`, menjadi editor untuk entri yang sudah ada.
 */
export default function Composer({
  journal,
  onDone,
  autoFocus,
}: {
  journal?: Journal;
  onDone?: () => void;
  autoFocus?: boolean;
}) {
  const id = useId();
  const save = useSaveJournal();
  const [text, setText] = useState(journal?.content ?? "");
  const [rawDetect, setDetect] = useState<Detect>({ kind: "empty" });
  const tooShort = text.trim().length < MIN_CHARS;
  const detect: Detect = tooShort ? { kind: "empty" } : rawDetect;
  const [flash, setFlash] = useState("");
  const barRef = useRef<HTMLSpanElement>(null);
  const reqRef = useRef(0);
  const [pick, setPick] = useState<Emotion | null>(null);

  useEffect(() => {
    const trimmed = text.trim();
    const req = ++reqRef.current;
    if (trimmed.length < MIN_CHARS) return;
    const t = setTimeout(async () => {
      setDetect((d) => (d.kind === "result" ? d : { kind: "reading" }));
      try {
        const r = await predictEmotion(trimmed);
        if (req !== reqRef.current) return;
        const raw = Object.entries(r.fullDistribution) as [Emotion, number][];
        const sum = raw.reduce((a, [, v]) => a + v, 0) || 1;
        setPick(null);
        setDetect({
          dist: raw.map(([e, v]) => [e, v / sum] as [Emotion, number]).sort((a, b) => b[1] - a[1]),
          kind: "result",
          emotion: r.top1,
          confidence: r.top1Confidence,
          emotion2: r.top2,
          confidence2: r.top2Confidence,
          uncertain: r.uncertain,
        });
      } catch {
        if (req === reqRef.current) setDetect({ kind: "error" });
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [text]);

  const confident = detect.kind === "result" && !detect.uncertain;

  useGSAP(
    () => {
      const bar = barRef.current;
      const form = bar?.closest("form");
      if (!bar || !form) return;
      const color = confident
        ? EMOTION_HEX[(detect as Extract<Detect, { kind: "result" }>).emotion]
        : getComputedStyle(document.documentElement).getPropertyValue("--ck-mood-none").trim();
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(bar, { backgroundColor: color, scale: confident ? 1 : 0.8, duration: 0.6, ease: "back.out(2)" });
        gsap.to(form, { borderColor: confident ? color : lineColor(), duration: 0.6, ease: "power2.out" });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(bar, { backgroundColor: color });
        gsap.set(form, { borderColor: confident ? color : lineColor() });
      });
    },
    { dependencies: [detect.kind, rawDetect] }
  );

  function submit() {
    const content = text.trim();
    if (!content || save.isPending) return;
    const r = detect.kind === "result" ? detect : null;
    const chosen = r && !r.uncertain ? pick ?? r.emotion : null;
    const chosenConf = r && chosen ? r.dist.find(([e]) => e === chosen)?.[1] ?? r.confidence : null;
    save.mutate(
      {
        id: journal?.id,
        content,
        emotion: chosen,
        confidence: chosenConf,
        emotion2: r && !r.uncertain ? r.emotion2 : null,
        confidence2: r && !r.uncertain ? r.confidence2 : null,
      },
      {
        onSuccess: () => {
          if (!journal) setText("");
          setPick(null);
          setFlash(journal ? "Perubahan disimpan." : "Tersimpan di jurnal.");
          setTimeout(() => setFlash(""), 3000);
          onDone?.();
        },
      }
    );
  }

  const status = (() => {
    if (save.isError) {
      return save.error instanceof ApiError ? save.error.message : "Gagal menyimpan. Coba lagi.";
    }
    if (flash) return flash;
    switch (detect.kind) {
      case "empty":
        return "Emosi dibaca di perangkat";
      case "reading":
        return "Membaca emosi…";
      case "error":
        return "Deteksi emosi tidak tersedia";
      case "result":
        return detect.uncertain
          ? "Emosi belum jelas — tulis sedikit lagi"
          : "Emosi terbaca, pilih lain bila kurang pas";
    }
  })();

  const res = detect.kind === "result" && !detect.uncertain ? detect : null;
  const shown = res ? pick ?? res.emotion : null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex flex-col rounded-clay-lg border border-line bg-surface shadow-[0_8px_24px_-12px_rgba(20,28,56,.12)]"
    >
      <div className="flex items-center justify-between gap-3 px-5 pt-5">
        <label htmlFor={id} className="text-[13px] font-semibold">
          {journal ? "Ubah curhat" : "Tulis curhat"}
        </label>
        <span className="flex items-center gap-1.5 text-[12px] text-ink-muted">
          <Icon name="lock" className="h-[13px] w-[13px]" />
          Hanya kamu yang bisa membaca
        </span>
      </div>
      <textarea
        id={id}
        value={text}
        autoFocus={autoFocus}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
        }}
        placeholder="Apa yang sedang kamu rasakan? Ceritakan saja, tidak ada yang menilai."
        rows={5}
        maxLength={10000}
        className="block min-h-32 w-full resize-none bg-transparent px-5 py-4 text-[16px] leading-[1.6] text-ink outline-none placeholder:text-ink-muted/70"
      />
      {res && shown ? (
        <div className="grid gap-5 border-t border-line px-5 py-4 sm:grid-cols-2 sm:items-center">
          <div>
            <p className="text-[13px] font-semibold">Emosi yang terbaca</p>
            <div className="mt-2 flex items-center gap-3">
              <span aria-hidden="true" className={`h-[22px] w-[22px] rounded-full ${EMOTION_BG[shown]}`} />
              <div>
                <b className="text-[20px] font-semibold tracking-[-0.02em]">{shown}</b>
                <p className="text-[12px] text-ink-muted">
                  Keyakinan {Math.round((res.dist.find(([e]) => e === shown)?.[1] ?? 0) * 100)}% · diproses di perangkatmu
                </p>
              </div>
            </div>
            <p className="mt-2.5 text-[13px] text-ink-muted">Kurang pas? Pilih emosi lain sebelum menyimpan.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {res.dist.slice(0, 4).map(([e]) => (
                <button
                  key={e}
                  type="button"
                  aria-pressed={shown === e}
                  onClick={() => setPick(e)}
                  className={
                    "inline-flex min-h-8 items-center gap-2 rounded-full border px-3 text-[12.5px] font-medium " +
                    (shown === e ? "border-ink bg-ink text-bg" : "border-line-strong hover:bg-surface-strong")
                  }
                >
                  <span aria-hidden="true" className={`h-2 w-2 rounded-full ${EMOTION_BG[e]}`} />
                  {e}
                </button>
              ))}
            </div>
          </div>
          <ul className="flex flex-col gap-2">
            {res.dist.slice(0, 5).map(([e, p]) => (
              <li key={e} className="grid grid-cols-[76px_minmax(0,1fr)_40px] items-center gap-2.5 text-[12.5px]">
                <span>{e}</span>
                <span className="h-1.5 overflow-hidden rounded-full bg-surface-strong">
                  <span className={`block h-full rounded-full ${EMOTION_BG[e]}`} style={{ width: `${Math.round(p * 100)}%` }} />
                </span>
                <span className="text-right font-mono text-ink-muted">{Math.round(p * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
        <span aria-live="polite" className="flex min-w-0 items-center gap-2 text-caption text-ink-muted">
          <span ref={barRef} aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full bg-mood-none" />
          {status}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {journal && onDone ? (
            <button type="button" onClick={onDone} className="min-h-10 rounded-full px-4 text-[13.5px] font-semibold text-ink-muted hover:bg-surface-strong">
              Batal
            </button>
          ) : null}
          <button
            type="submit"
            disabled={!text.trim() || save.isPending}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-invert px-5 text-[13.5px] font-semibold text-on-invert transition-[transform,opacity,filter] hover:brightness-110 active:scale-[0.97] disabled:opacity-40"
          >
            {save.isPending ? "Menyimpan…" : journal ? "Simpan" : "Simpan curhat"}
          </button>
        </span>
      </div>
    </form>
  );
}
