"""Normalisasi cepat model.json yang sudah ada di public/ml (tanpa re-run penuh)."""
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "apps" / "web" / "public" / "ml"
p = OUT / "model.json"
topology = json.loads(p.read_text(encoding="utf-8"))
n_input = n_gru = 0
config = topology.get("modelTopology", {}).get("model_config", {}).get("config", {})
for layer in config.get("layers", []):
    cfg = layer.get("config", {}) if isinstance(layer, dict) else {}
    if "batch_shape" in cfg and "batchInputShape" not in cfg:
        cfg["batchInputShape"] = cfg.pop("batch_shape")
        n_input += 1
    if layer.get("class_name") == "GRU" and cfg.get("reset_after") is True:
        cfg["reset_after"] = False
        n_gru += 1

# Flatten batch dim bobot GRU bias [2, 3*units] → [2*3*units] (impl reset_after=false).
n_flat = 0
for group in topology.get("weightsManifest", []):
    for w in group.get("weights", []):
        shape = w.get("shape", [])
        if len(shape) == 2 and shape[0] == 2:
            w["shape"] = [shape[0] * shape[1]]
            n_flat += 1

p.write_text(json.dumps(topology, ensure_ascii=False), encoding="utf-8")
print(f"fixed {n_input} InputLayer + {n_gru} GRU, flattened {n_flat} bias")

