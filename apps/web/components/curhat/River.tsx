"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { EMOTION_BG, EMOTION_HEX, type Emotion } from "@/lib/ml/emotions";

gsap.registerPlugin(useGSAP);

const NONE = "var(--ck-mood-none)";
const hex = (e: Emotion | null) => (e ? EMOTION_HEX[e] : NONE);

export type RiverItem = {
  id: number | string;
  emotion: Emotion | null;
  meta: string;
  body: ReactNode;
  actions?: ReactNode;
};

/**
 * Sungai waktu: titik berwarna emosi per curhat, disambung garis yang
 * bergradasi dari emosi satu ke emosi berikutnya. Titik terakhir = "sekarang".
 * Saat muncul, garis mengalir dari atas ke bawah (satu momen GSAP).
 */
export default function River({ items, open = false }: { items: RiverItem[]; open?: boolean }) {
  const ref = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
        tl.from("[data-dot]", { scale: 0, duration: 0.35, stagger: 0.12 }, 0).from(
          "[data-flow]",
          { scaleY: 0, transformOrigin: "top", duration: 0.45, stagger: 0.12 },
          0.15
        );
      });
    },
    { scope: ref, dependencies: [items.length] }
  );

  return (
    <ol ref={ref} className="flex flex-col">
      {items.map((it, i) => {
        const next = items[i + 1];
        const last = !next && !open;
        return (
          <li key={it.id} className="flex gap-4">
            <span className="flex w-3.5 shrink-0 flex-col items-center pt-1" aria-hidden="true">
              <span
                data-dot
                className={
                  "h-3.5 w-3.5 shrink-0 rounded-full " +
                  (it.emotion ? EMOTION_BG[it.emotion] : "bg-mood-none")
                }
                style={last ? { boxShadow: `0 0 0 6px color-mix(in srgb, ${hex(it.emotion)} 25%, transparent)` } : undefined}
              />
              {!last ? (
                <span
                  data-flow
                  className="w-[3px] flex-1 rounded-full"
                  style={{ background: `linear-gradient(${hex(it.emotion)}, ${next ? hex(next.emotion) : "transparent"})` }}
                />
              ) : null}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1 pb-6">
              <p className="text-label text-ink-muted">{it.meta}</p>
              <div className="text-[15px] leading-relaxed">{it.body}</div>
              {it.actions}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
