"""Ekstrak bobot Keras → format raw TFJS dengan bobot GRU di-flatten sesuai
formula Keras 3 (reset_after=true, [bias_z, bias_r, bias_h] diringkas)."""
import json
import sys
from pathlib import Path

import numpy as np
import tensorflow as tf

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "source"
OUT = ROOT.parent / "apps" / "web" / "public" / "ml"
EMOTIONS = ["Waspada", "Marah", "Jijik", "Takut", "Senang", "Sedih", "Terkejut", "Percaya"]

print("[1/2] Loading model Keras 3 ...")
model = tf.keras.models.load_model(SRC / "emotion_prediction.keras")
model.summary()

specs = []
chunks = []
offset = 0

for layer in model.layers:
    lname = layer.name
    for w in layer.weights:
        arr = w.numpy().astype(np.float32, copy=False)
        wname = w.name.split("/")[-1].replace(":0", "")
        shape = list(arr.shape)

        # GRU bias Keras 3 [2, 3U] → [6U] dengan rumus Keras impl 2:
        #   b := b[0] + b[1] (axis=0); order concat [b_z, b_r, b_h] tetap.
        name = f"{lname}/{wname}"
        if len(shape) == 2 and shape[0] == 2 and shape[1] % 3 == 0:
            arr = (arr[0] + arr[1]).astype(np.float32)
            shape = [int(arr.shape[0])]
            print(f"      flatten {name}: {[2, shape[0] // 2]} -> {shape}")

        specs.append({"name": name, "shape": shape, "dtype": "float32"})
        data = arr.tobytes(order="C")
        chunks.append(data)
        offset += len(data)

blob = b"".join(chunks)
bin_name = "group1-shard1of1.bin"
(OUT / bin_name).write_bytes(blob)
print(f"[2/2] wrote {bin_name} ({len(blob)} bytes, {len(specs)} tensors)")

# Susun ulang model.json: pertahankan modelTopology (dengan normalisasi
# InputLayer/GRU) + ganti weightsManifest dengan spec hasil flatten.
gen_dir = ROOT / "generated" / "web_model"
model_json = json.loads((gen_dir / "model.json").read_text(encoding="utf-8"))
topo = model_json["modelTopology"]
config = topo.get("model_config", {}).get("config", {})
for layer in config.get("layers", []):
    cfg = layer.get("config", {}) if isinstance(layer, dict) else {}
    if "batch_shape" in cfg and "batchInputShape" not in cfg:
        cfg["batchInputShape"] = cfg.pop("batch_shape")
    if layer.get("class_name") == "GRU" and cfg.get("reset_after") is True:
        cfg["reset_after"] = False

topology = {
    "modelTopology": topo,
    "weightsManifest": [{"paths": [f"./{bin_name}"], "weights": specs}],
}
(OUT / "model.json").write_text(json.dumps(topology, ensure_ascii=False), encoding="utf-8")
print("      wrote model.json (topology + flattened manifest)")
print("DONE")
