/**
 * Emosi & warna mood — urutan kelas persis dari model lama
 * (Testing Input.ipynb) + token warna mood dari design.md §1.2.
 */
export const EMOTIONS = [
  "Waspada",
  "Marah",
  "Jijik",
  "Takut",
  "Senang",
  "Sedih",
  "Terkejut",
  "Percaya",
] as const;

export type Emotion = (typeof EMOTIONS)[number];

export const EMOTION_EMOJI: Record<Emotion, string> = {
  Waspada: "🧐",
  Marah: "😠",
  Jijik: "🤢",
  Takut: "😨",
  Senang: "😊",
  Sedih: "😢",
  Terkejut: "😲",
  Percaya: "🤝",
};

/** Kelas Tailwind bg-<mood> — samakan dgn token di globals.css */
export const EMOTION_BG: Record<Emotion, string> = {
  Waspada: "bg-mood-waspada",
  Marah: "bg-mood-marah",
  Jijik: "bg-mood-jijik",
  Takut: "bg-mood-takut",
  Senang: "bg-mood-senang",
  Sedih: "bg-mood-sedih",
  Terkejut: "bg-mood-terkejut",
  Percaya: "bg-mood-percaya",
};

export interface EmotionResult {
  top1: Emotion;
  top1Confidence: number;
  top2: Emotion;
  top2Confidence: number;
  /** true jika confidence top-1 < threshold → tampilkan "emosi tidak pasti" */
  uncertain: boolean;
}

/** Threshold keyakinan — baca dari meta.json di UI (default 0.4). */
export const UNCERTAIN_THRESHOLD = 0.4;

/** Urutkan probabilitas softmax → top-2 ternormalisasi (cara notebook). */
export function toEmotionResult(
  probs: number[],
  threshold: number = UNCERTAIN_THRESHOLD
): EmotionResult {
  const order = probs
    .map((p, i) => [p, i] as const)
    .sort((a, b) => b[0] - a[0]);
  const [p1, i1] = order[0];
  const [p2, i2] = order[1];
  const total = p1 + p2;
  const top1Confidence = total > 0 ? p1 / total : 0;
  return {
    top1: EMOTIONS[i1],
    top1Confidence,
    top2: EMOTIONS[i2],
    top2Confidence: total > 0 ? p2 / total : 0,
    uncertain: top1Confidence < threshold,
  };
}

/** Hex warna emosi — dipakai GSAP untuk tween warna (harus sama dgn globals.css). */
export const EMOTION_HEX: Record<Emotion, string> = {
  Waspada: "#ffc79b",
  Marah: "#ff9b9b",
  Jijik: "#c5d8a0",
  Takut: "#c9b4e8",
  Senang: "#ffd97d",
  Sedih: "#9bb8e8",
  Terkejut: "#ffb3c8",
  Percaya: "#a5dcb5",
};
