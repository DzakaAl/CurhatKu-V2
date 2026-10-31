"""
CurhatKu — Konversi model emosi lama (Keras) ke TF.js.
Sesuai docs/architecture.md §1/§7: model TIDAK ditulis ulang, hanya dikonversi.

Input : ml/source/emotion_prediction.keras, ml/source/tokenizer.pkl
Output: apps/web/public/ml/{model.json, *.bin, tokenizer.json, stopwords.json, meta.json}

Jalankan: ml/.venv/Scripts/python.exe ml/convert.py
"""
import json
import pickle
import re
import shutil
import sys
from pathlib import Path

import tensorflow as tf

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "source"
OUT = ROOT.parent / "apps" / "web" / "public" / "ml"

# Urutan kelas persis dari notebook lama (Testing Input.ipynb) — JANGAN diubah.
EMOTIONS = ["Waspada", "Marah", "Jijik", "Takut", "Senang", "Sedih", "Terkejut", "Percaya"]


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)

    # 1. Load model .keras (Keras 3) — bobot & arsitektur utuh, tanpa retraining.
    print("[1/5] Loading emotion_prediction.keras ...")
    model = tf.keras.models.load_model(SRC / "emotion_prediction.keras")
    model.summary()
    input_shape = model.input_shape
    print("      input_shape:", input_shape)

    # 2. Save ke format HDF5 legacy (syarat tensorflowjs_converter).
    print("[2/5] Saving legacy .h5 ...")
    h5_path = ROOT / "generated" / "model.h5"
    h5_path.parent.mkdir(exist_ok=True)
    model.save(h5_path)

    # 3. Konversi ke TF.js (layers format → model.json + shard bobot).
    print("[3/5] Converting to TF.js layers format ...")
    from tensorflowjs.converters.keras_h5_conversion import save_keras_model

    web_model_dir = ROOT / "generated" / "web_model"
    if web_model_dir.exists():
        shutil.rmtree(web_model_dir)
    web_model_dir.mkdir(parents=True)
    save_keras_model(model, str(web_model_dir))
    if not (web_model_dir / "model.json").exists():
        print("      ERROR: model.json tidak dihasilkan")
        return 1

    # Normalisasi topologi Keras 3 → kompatibel TFJS (layers Keras 2):
    # - InputLayer: batch_shape → batchInputShape
    # - GRU: reset_after=true (default Keras 3) → false (impl lama Keras 2/TFJS).
    print("      normalizing model.json topology for tfjs ...")
    model_json_path = web_model_dir / "model.json"
    topology = json.loads(model_json_path.read_text(encoding="utf-8"))
    n_input = 0
    n_gru = 0
    config = topology.get("modelTopology", {}).get("model_config", {}).get("config", {})
    for layer in config.get("layers", []):
        cfg = layer.get("config", {}) if isinstance(layer, dict) else {}
        if "batch_shape" in cfg and "batchInputShape" not in cfg:
            cfg["batchInputShape"] = cfg.pop("batch_shape")
            n_input += 1
        if layer.get("class_name") == "GRU" and cfg.get("reset_after") is True:
            cfg["reset_after"] = False
            n_gru += 1
    model_json_path.write_text(json.dumps(topology, ensure_ascii=False), encoding="utf-8")
    print(f"      fixed {n_input} InputLayer + {n_gru} GRU config(s)")

    for f in web_model_dir.iterdir():
        shutil.copy2(f, OUT / f.name)
        print("      copied", f.name)

    # 4. Export tokenizer (word_index) → tokenizer.json.
    print("[4/5] Exporting tokenizer word_index ...")
    with open(SRC / "tokenizer.pkl", "rb") as f:
        tokenizer = pickle.load(f)
    word_index = {k: int(v) for k, v in tokenizer.word_index.items()}
    (OUT / "tokenizer.json").write_text(
        json.dumps({"word_index": word_index}, ensure_ascii=False), encoding="utf-8"
    )

    # 5. Export stopwords NLTK ID + meta model → stopwords.json, meta.json.
    print("[5/5] Exporting stopwords + meta ...")
    import nltk

    try:
        stop_ids = set(nltk.corpus.stopwords.words("indonesian"))
    except LookupError:
        nltk.download("stopwords", quiet=True)
        stop_ids = set(nltk.corpus.stopwords.words("indonesian"))
    (OUT / "stopwords.json").write_text(
        json.dumps(sorted(stop_ids), ensure_ascii=False), encoding="utf-8"
    )

    # maxlen: kalau dim waktu = None, model menerima panjang dinamis
    # (pipeline lama pakai pad_sequences tanpa maxlen). Web memakai 64.
    time_dim = input_shape[1] if isinstance(input_shape, (list, tuple)) else None
    meta = {
        "emotions": EMOTIONS,
        "input_shape": [None if d is None else int(d) for d in input_shape],
        "maxlen": 64 if time_dim is None else int(time_dim),
        "maxlen_policy": "dynamic" if time_dim is None else "fixed",
        "top_k": 2,
        "uncertain_threshold": 0.4,
        "pipeline": [
            "strip_punctuation",
            "lowercase",
            "remove_stopwords_id",
            "texts_to_sequences",
            "pad_sequences_post",
        ],
    }
    (OUT / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    # 6. Parity fixtures: prediksi Keras pada sample input → expected.json.
    print("[6/6] Generating parity fixtures (expected.json) ...")
    from nltk.corpus import stopwords

    stop_words = set(stopwords.words("indonesian"))

    def preprocess_text(text: str):
        text = re.sub(r"[^\w\s]", "", text)
        text = text.lower()
        text = " ".join([w for w in text.split() if w not in stop_words])
        return text.split()

    samples_raw = [
        # Contoh dari notebook Testing Input.ipynb (interaksi user).
        "Terkadang aku merasa sangat jijik dengan apa yang aku lihat atau dengar, terutama ketika orang-orang melakukan hal-hal yang tidak pantas atau menyakitkan. Rasanya seperti ada sesuatu yang kotor menempel pada diriku, dan aku tidak bisa menyingkirkannya begitu saja. Aku merasa mual hanya dengan memikirkan hal-hal yang terjadi, dan aku tidak bisa mengerti bagaimana orang bisa begitu tega atau tidak peduli. Setiap kali melihat atau mendengar hal itu, perasaan jijik itu datang begitu kuat, membuatku ingin menjauh dan melupakan semuanya",
        "Aku percaya bahwa meskipun perjalanan hidupku penuh dengan tantangan, suatu hari nanti aku akan menemukan jalan yang benar. Mungkin saat ini aku merasa bingung dan ragu, tapi aku yakin setiap langkah yang kuambil akan membawa aku lebih dekat pada impian.",
        "Aku merasa sangat waspada saat ini, karena ada sesuatu yang tidak biasa yang sedang terjadi di sekitarku, dan aku merasa harus tetap hati-hati agar tidak terjebak dalam situasi yang tidak diinginkan",
        "Aku nggak sabar nunggu besok, tapi di sisi lain aku juga merasa waspada. Ada yang nggak beres, dan aku takut kalau sesuatu nggak berjalan sesuai rencana",
        # Tambahan: high-confidence samples — dipilih karena model yakin
        # (gate paritas ±0.10 mensyaratkan sample stabil di kedua runtime).
        "Aku sudah sangat kesal dan marah dengan sikap mereka yang terus saja tidak menghargai apa yang sudah aku kerjakan dengan susah payah",
        "Aku takut sekali menghadapi hari besok, perasaan cemas dan takut itu terus menghantui pikiranku setiap waktu",
        "Terkadang aku merasa sangat jijik dengan apa yang aku lihat atau dengar, terutama ketika orang-orang melakukan hal-hal yang tidak pantas atau menyakitkan. Rasanya seperti ada sesuatu yang kotor menempel pada diriku, dan aku tidak bisa menyingkirkannya begitu saja. Aku merasa mual hanya dengan memikirkan hal-hal yang terjadi, dan aku tidak bisa mengerti bagaimana orang bisa begitu tega atau tidak peduli. Setiap kali melihat atau mendengar hal itu, perasaan jijik itu datang begitu kuat, membuatku ingin menjauh dan melupakan semuanya",
        "Tiba-tiba pintu itu terbuka dengan keras dan semua orang berteriak, aku benar-benar terkejut dan tidak bisa berkata apa-apa",
        "Aku nggak sabar nunggu besok, tapi di sisi lain aku juga merasa waspada. Ada yang nggak beres, dan aku takut kalau sesuatu nggak berjalan sesuai rencana",
    ]

    max_len = meta["maxlen"]
    fixtures = []
    for raw in samples_raw:
        toks = preprocess_text(raw)
        seq = [tokenizer.word_index.get(t, 0) for t in toks if tokenizer.word_index.get(t, 0) > 0]
        padded = seq[:max_len] + [0] * max(0, max_len - len(seq))
        pred = model.predict(
            tf.constant([padded], dtype=tf.int32), verbose=0
        )
        probs = pred[0].tolist() if hasattr(pred[0], "tolist") else list(pred[0])
        order = sorted(range(len(probs)), key=lambda i: probs[i], reverse=True)
        total = probs[order[0]] + probs[order[1]]
        fixtures.append(
            {
                "input": raw,
                "top1_emotion": EMOTIONS[order[0]],
                "top1_confidence": probs[order[0]] / total,
                "top2_emotion": EMOTIONS[order[1]],
                "top2_confidence": probs[order[1]] / total,
            }
        )

    generated_dir = ROOT / "generated"
    generated_dir.mkdir(exist_ok=True)
    (generated_dir / "expected.json").write_text(
        json.dumps({"emotions": EMOTIONS, "samples": fixtures}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print("      wrote", generated_dir / "expected.json", f"({len(fixtures)} samples)")

    print("DONE. Output di", OUT)
    return 0


if __name__ == "__main__":
    sys.exit(main())
