const MOODS = ["senang", "percaya", "sedih", "marah", "takut", "jijik", "terkejut", "waspada"];

/** Avatar inisial berwarna emosi, warnanya tetap untuk nama yang sama. */
export default function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  let h = 7;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) | 0;
  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-full font-bold text-night"
      style={{ width: size, height: size, fontSize: size * 0.38, background: `var(--ck-mood-${MOODS[Math.abs(h) % MOODS.length]})` }}
    >
      {name.trim().slice(0, 1).toUpperCase()}
    </span>
  );
}

/** "Embun Pagi #1093" → ["Embun Pagi", "#1093"] */
export const splitHandle = (h: string): [string, string] => {
  const i = h.lastIndexOf(" #");
  return i < 0 ? [h, ""] : [h.slice(0, i), h.slice(i + 1)];
};
