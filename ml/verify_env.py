import json
import os
import subprocess
import sys
from pathlib import Path

out_path = Path(__file__).resolve().parent / "verify_env.result.json"
result = {}

# 1) TF core
try:
    import tensorflow as tf

    result["tf"] = tf.__version__
except Exception as e:  # noqa: BLE001
    result["tf"] = f"ERROR: {e}"

# 2) TFJS converter CLI: jalankan via subprocess dengan env yang skip TDFS
#    total (modul C++ inference.so tidak tersedia di Windows untuk TDFS 1.8.1;
#    kita hanya butuh jalur Keras H5 → tfjs_layers_model).
probe = subprocess.run(
    [sys.executable, "-m", "tensorflowjs.converters.converter", "--help"],
    capture_output=True,
    text=True,
    timeout=120,
    env={**os.environ, "TFDF_DISABLE": "1"},
)
result["converter_cli_exit"] = probe.returncode
result["converter_cli_tail"] = (probe.stderr or probe.stdout or "")[-1200:]

result["ok"] = not str(result.get("tf", "")).startswith("ERROR") and probe.returncode == 0
out_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
