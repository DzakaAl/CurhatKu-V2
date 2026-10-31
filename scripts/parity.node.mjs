/**
 * CurhatKu — Parity test sisi Node (TF.js).
 * Bandingkan hasil inferensi TF.js (backend CPU di Node) dengan expected.json
 * hasil Keras asli. Gate: label identik, confidence selisih ≤ 0.10
 * (docs/architecture.md §8).
 *
 * Jalankan: node scripts/parity.node.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.resolve(__dirname, "../apps/web");

// Backend CPU murni-JS dari @tensorflow/tfjs via createRequire (main = tf.node.js).
// require() accept absolute Windows path & CJS resolve kernel — robusti.
const require = createRequire(import.meta.url);
const tf = require(path.join(WEB, "node_modules/@tensorflow/tfjs"));
await tf.setBackend("cpu");
await tf.ready();

const expected = JSON.parse(
  readFileSync(path.resolve(__dirname, "../ml/generated/expected.json"), "utf8")
);
const meta = JSON.parse(readFileSync(`${WEB}/public/ml/meta.json`, "utf8"));
const tokenizer = JSON.parse(readFileSync(`${WEB}/public/ml/tokenizer.json`, "utf8"));
const stopwords = new Set(JSON.parse(readFileSync(`${WEB}/public/ml/stopwords.json`, "utf8")));

// ---- Preprocess (replikasi persis, sama dengan lib/ml/preprocess.ts) ----
function tokenizeText(text) {
  const stripped = text.replace(/[^\w\s]|_/g, "");
  const lowered = stripped.toLowerCase();
  return lowered.split(/\s+/).filter((w) => w.length > 0 && !stopwords.has(w));
}

function toInput(text, maxlen) {
  const tokens = tokenizeText(text);
  const seq = tokens.map((t) => tokenizer.word_index[t] ?? 0).filter((i) => i > 0);
  const padded = seq.slice(0, maxlen);
  while (padded.length < maxlen) padded.push(0);
  return padded;
}

// ---- Load model TF.js dari disk (IO handler manual — bekerja di Node murni) ----
const MODEL_DIR = `${WEB}/public/ml`;
const ioHandler = {
  load: async () => {
    const modelJSON = JSON.parse(readFileSync(`${MODEL_DIR}/model.json`, "utf8"));
    const manifest = modelJSON.weightsManifest;
    const weightSpecs = manifest.flatMap((g) => g.weights);
    const buffers = [];
    for (const group of manifest) {
      for (const p of group.paths) {
        buffers.push(readFileSync(`${MODEL_DIR}/${p}`));
      }
    }
    const all = Buffer.concat(buffers);
    const weightData = all.buffer.slice(all.byteOffset, all.byteOffset + all.byteLength);
    // ModelArtifacts datar: { modelTopology, weightSpecs, weightData }.
    return {
      modelTopology: modelJSON.modelTopology,
      weightSpecs,
      weightData,
    };
  },
};
const model = await tf.loadLayersModel(ioHandler);
const maxlen = meta.maxlen;

// ---- Bandingkan ----
let pass = 0;
let fail = 0;
console.log(`maxlen=${maxlen} | ${expected.samples.length} samples\n`);

for (const s of expected.samples) {
  const input = tf.tensor2d(
    Int32Array.from(toInput(s.input, maxlen)),
    [1, maxlen],
    "int32"
  );
  const pred = model.predict(input);
  const out = Array.from(pred.dataSync());
  pred.dispose();
  input.dispose();

  const idx = out
    .map((p, i) => [p, i])
    .sort((a, b) => b[0] - a[0]);
  const total = idx[0][0] + idx[1][0];
  const top1 = expected.emotions[idx[0][1]];
  const top1Conf = idx[0][0] / total;

  const labelOk = top1 === s.top1_emotion;
  const confOk = Math.abs(top1Conf - s.top1_confidence) <= 0.1;
  const ok = labelOk && confOk;
  ok ? pass++ : fail++;
  console.log(
    `${ok ? "PASS" : "FAIL"} | py: ${s.top1_emotion} ${(s.top1_confidence * 100).toFixed(1)}% | ` +
      `tfjs: ${top1} ${(top1Conf * 100).toFixed(1)}% | Δ${Math.abs(top1Conf - s.top1_confidence).toFixed(4)} | ` +
      `"${s.input.slice(0, 38)}"`
  );
}

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail > 0 ? 1 : 0);

