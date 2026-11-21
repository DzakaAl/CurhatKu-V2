const MOODS = ["senang", "percaya", "sedih", "marah", "takut", "jijik", "terkejut", "waspada"];

/** Sampul artikel: pola titik + dua bulatan warna emosi, tetap untuk slug yang sama. */
export default function Cover({ seed, className = "" }: { seed: string; className?: string }) {
  let h = 7;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) | 0;
  const a = MOODS[Math.abs(h) % 8];
  const b = MOODS[(Math.abs(h >> 3) + 3) % 8];
  return (
    <div aria-hidden="true" className={`relative aspect-[16/7] max-w-full overflow-hidden rounded-[14px] bg-surface-strong ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(var(--ck-line-strong)_1px,transparent_1.3px)] bg-[length:14px_14px]" />
      <i className="absolute -top-[30%] left-[8%] aspect-square w-[46%] rounded-full opacity-75 blur-[2px]" style={{ background: `var(--ck-mood-${a})` }} />
      <i className="absolute -bottom-[35%] right-[10%] aspect-square w-[34%] rounded-full opacity-75 blur-[2px]" style={{ background: `var(--ck-mood-${b})` }} />
    </div>
  );
}
