import * as tf from "@tensorflow/tfjs";
import type { EmotionResult } from "./emotions";
import { EMOTIONS, toEmotionResult } from "./emotions";
import { preprocessToTensorData } from "./preprocess";

/**
 * Loader model TF.js (lazy, client-only) + inference emosi.
 * Aset di /ml/public berasal dari ml/convert.py — model GRU asli,
 * TIDAK ditulis ulang (architecture.md §1/§7).
 */

let modelPromise: Promise<tf.LayersModel> | null = null;
let metaCache: { maxlen: number; uncertain_threshold: number } | null = null;

export async function loadMeta(): Promise<{
  maxlen: number;
  uncertain_threshold: number;
}> {
  if (metaCache) return metaCache;
  const res = await fetch("/ml/meta.json");
  if (!res.ok) throw new Error(`Gagal memuat meta.json: ${res.status}`);
  metaCache = (await res.json()) as {
    maxlen: number;
    uncertain_threshold: number;
  };
  return metaCache;
}

export async function loadModel(): Promise<tf.LayersModel> {
  if (!modelPromise) {
    modelPromise = tf.loadLayersModel("/ml/model.json");
  }
  return modelPromise;
}

export interface PredictOutput extends EmotionResult {
  fullDistribution: Record<string, number>;
}

export async function predictEmotion(
  text: string,
  maxlen?: number
): Promise<PredictOutput> {
  const meta = await loadMeta();
  const len = maxlen ?? meta.maxlen;
  const model = await loadModel();
  const { data, shape } = await preprocessToTensorData(text, { maxlen: len });

  const input = tf.tensor2d(data, shape, "int32");
  const pred = model.predict(input) as tf.Tensor2D;
  const out = Array.from(pred.dataSync());
  pred.dispose();
  input.dispose();

  if (out.length !== EMOTIONS.length) {
    throw new Error(`Model output ${out.length} kelas, expected ${EMOTIONS.length}`);
  }

  // Top-2 + normalisasi persis notebook lama → skor 0..1.
  const result = toEmotionResult(out, meta.uncertain_threshold);

  return {
    ...result,
    fullDistribution: Object.fromEntries(EMOTIONS.map((e, i) => [e, out[i]])),
  };
}

/** Bersihkan memori model (untuk HMR/test). */
export async function disposeModel(): Promise<void> {
  if (modelPromise) {
    (await modelPromise).dispose();
    modelPromise = null;
  }
}

