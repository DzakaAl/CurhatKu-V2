import type { Emotion } from "@/lib/ml/emotions";

const LAYERS: Emotion[] = ["Senang", "Percaya", "Sedih", "Waspada", "Takut", "Terkejut"];
const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const VAR: Record<Emotion, string> = {
  Senang: "var(--ck-mood-senang)", Percaya: "var(--ck-mood-percaya)", Sedih: "var(--ck-mood-sedih)", Waspada: "var(--ck-mood-waspada)",
  Takut: "var(--ck-mood-takut)", Terkejut: "var(--ck-mood-terkejut)", Marah: "var(--ck-mood-marah)", Jijik: "var(--ck-mood-jijik)",
};

const W = 640, H = 380, N = DAYS.length;
const x = (i: number) => 40 + (i * (W - 80)) / (N - 1);

/** Geometri dihitung sekali di level modul (data contoh tetap, deterministik). */
function buildPaths() {
  let seed = 11;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const v = LAYERS.map((m) =>
    DAYS.map((_, i) => 0.35 + rand() * 1.1 + (m === "Waspada" && i >= 4 ? 1.2 : 0) + (m === "Senang" && i === 4 ? 0.9 : 0))
  );
  const tot = DAYS.map((_, i) => v.reduce((a, r) => a + r[i], 0));
  const k = (H - 90) / Math.max(...tot);
  const base = DAYS.map((_, i) => (H - 50) / 2 - (tot[i] * k) / 2 + 10);
  const r1 = (n: number) => Math.round(n * 10) / 10;
  const seg = (pts: number[][]) =>
    pts.slice(1).map((p, i) => {
      const q = pts[i], mx = r1((q[0] + p[0]) / 2);
      return `C${mx},${r1(q[1])} ${mx},${r1(p[1])} ${r1(p[0])},${r1(p[1])}`;
    }).join("");
  let acc = DAYS.map(() => 0);
  return LAYERS.map((m, li) => {
    const top = DAYS.map((_, i) => [x(i), base[i] + acc[i] * k]);
    acc = acc.map((a, i) => a + v[li][i]);
    const bot = DAYS.map((_, i) => [x(i), base[i] + acc[i] * k]).reverse();
    return { m, d: `M${r1(top[0][0])},${r1(top[0][1])}${seg(top)}L${r1(bot[0][0])},${r1(bot[0][1])}${seg(bot)}Z` };
  });
}
const PATHS = buildPaths();

/** Sungai emosi contoh (streamgraph 7 hari). */
export default function River() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible" role="img" aria-label="Contoh sungai emosi seminggu: Waspada makin besar menjelang akhir pekan">
      {PATHS.map((p) => (
        <path key={p.m} d={p.d} fill={VAR[p.m]} opacity={0.92} />
      ))}
      <line x1={x(5)} x2={x(5)} y1={18} y2={H - 44} stroke="var(--ck-ink)" strokeDasharray="3 5" opacity={0.5} />
      <circle cx={x(5)} cy={18} r={4} fill="var(--ck-ink)" />
      <text x={x(5) - 10} y={22} textAnchor="end" fontSize={13} fontWeight={600} fill="var(--ck-ink)">
        Hari ini · Waspada
      </text>
      {DAYS.map((d, i) => (
        <text key={d} x={x(i)} y={H - 16} textAnchor="middle" fontSize={12} fill="var(--ck-ink-muted)">
          {d}
        </text>
      ))}
    </svg>
  );
}
