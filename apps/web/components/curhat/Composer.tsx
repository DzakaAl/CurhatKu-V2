"use client";

import { useEffect, useId, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { EMOTION_HEX, type Emotion } from "@/lib/ml/emotions";
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

  useEffect(() => {
    const trimmed = text.trim();
    const req = ++reqRef.current;
    if (trimmed.length < MIN_CHARS) return;
    const t = setTimeout(async () => {
      setDetect((d) => (d.kind === "result" ? d : { kind: "reading" }));
      try {
        const r = await predictEmotion(trimmed);
        if (req !== reqRef.current) return;
        setDetect({
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
    save.mutate(
      {
        id: journal?.id,
        content,
        emotion: r && !r.uncertain ? r.emotion : null,
        confidence: r && !r.uncertain ? r.confidence : null,
        emotion2: r && !r.uncertain ? r.emotion2 : null,
        confidence2: r && !r.uncertain ? r.confidence2 : null,
      },
      {
        onSuccess: () => {
          if (!journal) setText("");
          setFlash(journal ? "Perubahan disimpan." : "Ditambahkan ke alurmu.");
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
          : `Terdeteksi: ${detect.emotion} · ${Math.round(detect.confidence * 100)}%`;
    }
  })();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex flex-col gap-3 rounded-clay-lg border border-line bg-surface p-5"
    >
      <label htmlFor={id} className="text-h3 font-extrabold tracking-[-0.02em]">
        {journal ? "Ubah curhat" : "Lanjutkan alurnya"}
      </label>
      <textarea
        id={id}
        value={text}
        autoFocus={autoFocus}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
        }}
        placeholder="Hari ini, aku…"
        rows={5}
        maxLength={10000}
        className="block min-h-32 w-full resize-none bg-transparent text-[17px] leading-[1.5] text-ink outline-none placeholder:text-ink-muted/80"
      />
      <div className="flex items-center justify-between gap-3">
        <span aria-live="polite" className="flex min-w-0 items-center gap-2 text-caption text-ink-muted">
          <span ref={barRef} aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full bg-mood-none" />
          {status}
        </span>
        <button
          type="submit"
          disabled={!text.trim() || save.isPending}
          className="min-h-12 shrink-0 rounded-full bg-invert px-6 text-[15px] font-extrabold text-on-invert transition-[transform,opacity] active:scale-[0.97] disabled:opacity-40"
        >
          {save.isPending ? "Menyimpan…" : journal ? "Simpan" : "Tambahkan"}
        </button>
      </div>
    </form>
  );
}
