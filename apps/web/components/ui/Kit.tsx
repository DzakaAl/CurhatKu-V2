import { EMOTION_BG, type Emotion } from "@/lib/ml/emotions";

/** Titik warna emosi. */
export function Dot({ e, size = 10, className = "" }: { e: Emotion | null | undefined; size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 rounded-full ${e ? EMOTION_BG[e] : "bg-mood-none"} ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/** Avatar inisial netral (psikolog, profil). */
export function Initials({ name, size = 40, accent }: { name: string; size?: number; accent?: boolean }) {
  const ini = name
    .replace(/,.*$/, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden="true"
      className={"grid shrink-0 place-items-center rounded-full font-bold " + (accent ? "bg-accent-soft text-invert" : "bg-surface-strong text-ink-soft")}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {ini}
    </span>
  );
}

/** Daftar label–nilai rata kanan. */
export function KV({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="flex flex-col">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-3 py-[7px] text-[13px]">
          <dt className="text-ink-muted">{k}</dt>
          <dd className="text-right font-semibold">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Chip pilihan (filter). */
export function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={
        "inline-flex min-h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 text-[13px] font-medium transition-colors " +
        (on ? "border-ink bg-ink text-bg" : "border-line-strong text-ink-soft hover:bg-surface-strong")
      }
    >
      {children}
    </button>
  );
}

export const scrollRow = "-mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden";
