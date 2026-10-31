"""
CurhatKu — Parity test sisi Python.
Model + pipeline asli (Keras) → expected.json untuk dibandingkan dengan TF.js web.
Sesuai docs/architecture.md §8: label harus identik, confidence ±0.10.
"""
import json
import pickle
import re
import sys
from pathlib import Path

import numpy as np
import tensorflow as tf
from nltk.corpus import stopwords
from tensorflow.keras.preprocessing.sequence import pad_sequences

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "source"
OUT = ROOT / "generated"

SAMPLES = [
    "Aku hari ini merasa sangat bahagia banget, terima kasih semuanya!",
    "Hati aku sesak, aku sedih sekali sejak kamu pergi.",
    "Aku takut sekali menghadapi ujian besok, aku deg-degan.",
    "Dasar sialan! Aku marah besar sama dia!",
    "Wow, aku terkejut sekali melihat hasilnya!",
    "Aku percaya kamu bisa melakukannya, semangat ya!",
    "Hati-hati, waspada selalu dengan lingkungan sekitar.",
    "Alergi aku kambuh, jijik sekali melihat makanan itu.",
    "aku tidak tahu harus bagaimana lagi",
    "terima kasih banyak atas bantuannya ya",
]

EMOTIONS = ["Waspada", "Marah", "Jijik", "Takut", "Senang", "Sedih", "Terkejut", "Percaya"]


def main() -> int:
    import nltk

    try:
        stop = set(stopwords.words("indonesian"))
    except LookupError:
        nltk.download("stopwords", quiet=True)
        stop = set(stopwords.words("indonesian"))

    model = tf.keras.models.load_model(SRC / "emotion_prediction.keras")
    with open(SRC / "tokenizer.pkl", "rb") as f:
        tokenizer = pickle.load(f)

    results = []
    for text in SAMPLES:
        t = re.sub(r"[^\w\s]", "", text)
        t = t.lower()
        t = " ".join(w for w in t.split() if w not in stop)
        seq = tokenizer.texts_to_sequences([t.split()])
        padded = pad_sequences(seq, padding="post")
        pred = model.predict(padded, verbose=0)[0]
        order = pred.argsort()[-2:][::-1]
        results.append(
            {
                "input": text,
                "top1_emotion": EMOTIONS[order[0]],
                "top1_confidence": float(pred[order[0]]),
                "top2_emotion": EMOTIONS[order[1]],
                "top2_confidence": float(pred[order[1]]),
                "full_distribution": {EMOTIONS[i]: float(p) for i, p in enumerate(pred)},
            }
        )
        print(f"  {EMOTIONS[order[0]]:9s} {pred[order[0]]:.4f} | {EMOTIONS[order[1]]:9s} {pred[order[1]]:.4f} | {text[:40]}")

    OUT.mkdir(exist_ok=True)
    (OUT / "expected.json").write_text(
        json.dumps({"emotions": EMOTIONS, "samples": results}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print("expected.json written to", OUT)
    return 0


if __name__ == "__main__":
    sys.exit(main())
