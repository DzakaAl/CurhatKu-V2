"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { EMOTION_EMOJI, EMOTION_BG, type Emotion } from "@/lib/ml/emotions";
import { predictEmotion, loadModel } from "@/lib/ml/model";

/**
 * /dev/ml — bukti reuse ML service (Sprint 1):
 * model GRU lama (Keras) dikonversi ke TF.js & dipanggil dari browser
 * tanpa menulis ulang model (architecture.md §1/§7).
 */
export default function DevMlPage() {
  const [text, setText] = useState("Aku hari ini merasa sangat bahagia banget!");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<Awaited<ReturnType<typeof predictEmotion>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePredict() {
    setStatus("loading");
    setError(null);
    try {
      await loadModel(); // force load + tampilkan error model lebih jelas
      const r = await predictEmotion(text);
      setResult(r);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }

  return (
    <main className="mx-auto w-full max-w-clay min-h-dvh px-4 py-6">
      <h1 className="text-h1 font-extrabold">ML Service Check</h1>
      <p className="text-caption text-ink-muted mb-6">
        Inferensi emosi via TF.js di browser — model GRU asli hasil konversi, bukan
        ditulis ulang.
      </p>

      <div className="flex flex-col gap-4">
        <Input
          label="Teks untuk dianalisis"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tulis kalimat perasaanmu..."
        />
        <Button onClick={handlePredict} disabled={status === "loading" || text.trim() === ""}>
          {status === "loading" ? "Menganalisis..." : "Analisis Emosi"}
        </Button>

        {status === "error" && (
          <Card className="bg-mood-marah/30">
            <p className="text-caption font-bold text-ink">Error: {error}</p>
          </Card>
        )}

        {status === "done" && result && (
          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span
                className={`grid h-16 w-16 place-items-center rounded-clay-md text-h1 ${EMOTION_BG[result.top1 as Emotion]}`}
                aria-hidden="true"
              >
                {EMOTION_EMOJI[result.top1 as Emotion]}
              </span>
              <div>
                <p className="text-label text-ink-muted">Deteksi utama</p>
                <p className="text-h2 font-extrabold">
                  {result.top1} {EMOTION_EMOJI[result.top1 as Emotion]} ·{" "}
                  {(result.top1Confidence * 100).toFixed(0)}%
                </p>
                <p className="text-caption text-ink-muted">
                  Kedua: {result.top2} {EMOTION_EMOJI[result.top2 as Emotion]} ·{" "}
                  {(result.top2Confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            {result.uncertain && (
              <p className="text-label font-bold text-ink-muted">
                ⚠️ Confidence &lt; 40% — emosi tidak pasti.
              </p>
            )}

            <div className="flex flex-col gap-2">
              <p className="text-label font-bold">Distribusi 8 emosi:</p>
              {Object.entries(result.fullDistribution)
                .sort((a, b) => b[1] - a[1])
                .map(([emo, softmax]) => (
                  <div key={emo} className="flex items-center gap-2">
                    <span className="text-caption w-24 shrink-0">
                      {EMOTION_EMOJI[emo as Emotion]} {emo}
                    </span>
                    <div className="clay-inset h-4 flex-1 rounded-full bg-surface-soft">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.max(softmax * 100, 2)}%` }}
                      />
                    </div>
                    <span className="text-label w-12 text-right">{(softmax * 100).toFixed(1)}%</span>
                  </div>
                ))}
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
