import { EMOTIONS, type Emotion } from "./emotions";

/**
 * Preprocessing teks — replikasi PERSIS pipeline notebook lama:
 *   strip punctuation → lowercase → buang stopwords NLTK ID →
 *   texts_to_sequences → pad_sequences(post)
 * (Testing Input.ipynb, sel 0).
 */

// Dimuat sekali dari /ml/stopwords.json (hasil export NLTK di convert.py).
let stopwordsId: Set<string> | null = null;

export async function loadStopwords(): Promise<Set<string>> {
  if (stopwordsId) return stopwordsId;
  const res = await fetch("/ml/stopwords.json");
  if (!res.ok) throw new Error(`Gagal memuat stopwords.json: ${res.status}`);
  stopwordsId = new Set((await res.json()) as string[]);
  return stopwordsId;
}

/** Urutan token hasil preprocess — dipakai untuk texts_to_sequences. */
export function tokenizeText(text: string, stopwords: Set<string>): string[] {
  // notebook: re.sub(r'[^\w\s]', '', text) — hapus semua kecuali word char & whitespace
  const stripped = text.replace(/[^\w\s]|_/g, "");
  // notebook: text.lower()
  const lowered = stripped.toLowerCase();
  // notebook: buang stopwords lalu split
  return lowered.split(/\s+/).filter((w) => w.length > 0 && !stopwords.has(w));
}

let wordIndex: Record<string, number> | null = null;

export async function loadWordIndex(): Promise<Record<string, number>> {
  if (wordIndex) return wordIndex;
  const res = await fetch("/ml/tokenizer.json");
  if (!res.ok) throw new Error(`Gagal memuat tokenizer.json: ${res.status}`);
  const data = (await res.json()) as { word_index: Record<string, number> };
  wordIndex = data.word_index;
  return wordIndex;
}

/** Padanan Keras pad_sequences(padding='post') untuk satu sequence. */
export function padPost(seq: number[], maxlen: number): number[] {
  const padded = seq.slice(0, maxlen);
  while (padded.length < maxlen) padded.push(0);
  return padded;
}

export interface PreprocessOptions {
  maxlen: number;
}

/**
 * Teks → tensor input [1, maxlen] (Float32, karena tfjs layers Embedding
 * menerima int via one-hot internally; kita kirim int32 & cast di model.ts).
 */
export async function preprocessToTensorData(
  text: string,
  opts: PreprocessOptions
): Promise<{ data: Int32Array; shape: [number, number]; tokens: string[] }> {
  const [stopwords, index] = await Promise.all([loadStopwords(), loadWordIndex()]);
  const tokens = tokenizeText(text, stopwords);
  const seq = tokens.map((t) => index[t] ?? 0).filter((i) => i > 0);
  const padded = padPost(seq, opts.maxlen);
  return {
    data: Int32Array.from(padded),
    shape: [1, opts.maxlen],
    tokens,
  };
}

/** Urutan kelas untuk distribusi (sama dgn EMOTIONS). */
export function emotionAt(i: number): Emotion {
  return EMOTIONS[i];
}
