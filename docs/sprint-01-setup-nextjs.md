# Sprint 01 — Setup Next.js & Design System

## Selesai
- Scaffold `apps/web` (Next.js 16.3.5 App Router + TS + Tailwind v4 + React 19) + struktur folder per `architecture.md` §9.1 (`app/`, `components/ui|nav`, `lib/api|ml`, `middleware.ts`, `public/ml`).
- HTTP client `lib/api/client.ts` (fetch wrapper, cookie-aware JWT httpOnly, `NEXT_PUBLIC_API_URL`) + `QueryProvider` TanStack Query di root layout.
- Design system claymorphism dari `design.md` §1 hidup di kode: token warna di `globals.css` (`@theme`, padanan Tailwind v4 atas "Tailwind config"), Plus Jakarta Sans via `next/font/google`, radius 12/16/24/32, container 480px, type scale 12–30px.
- Komponen dasar: `Button` (clay raised→pressed), `Input` (clay-inset + label), `Card` (clay-raised); semua tap target ≥ 44px (`min-h-11`); focus-visible outline; `prefers-reduced-motion` dihormati.
- Navigasi: bottom-nav floating clay pill 5 tab persis `design.md` §3 (Dashboard, Mood & Journal, Forum, Artikel, Profil); Konsultasi via shortcut Home/Profil. Placeholder route `/` → redirect `/dashboard`; 5 halaman tab empty-state; `middleware.ts` placeholder terdokumentasi.
- Reuse ML (tanpa retraining sepatah pun): `emotion_prediction.keras` + `tokenizer.pkl` + `data.csv` diekstrak dari branch lama `origin/machine-learning`; konversi `ml/convert.py` → `ml/rebuild_weights.py` (Keras 3 → TF.js layers; bobot GRU bias diringkas `[bias_z, bias_r, bias_h]` sesuai rumus Keras impl 2; normalisasi `batch_shape`→`batchInputShape`, `reset_after`→false).
- Bukti koneksi: `scripts/parity.node.mjs` — TF.js CPU Node vs Keras Python, **9 pass 0 fail** (Δmax 0.0012, gate ±0.10 per `architecture.md` §8). UI bukti `/dev/ml`: input teks → inferensi TF.js di browser → top-2 emosi + distribusi 8 emosi.
- Smoke test: `next build` sukses (8 route static); server prod `:3100` — `/dashboard` 200 (Jakarta, bottom-nav, clay, H1✓), `/dev/ml` 200, `/ml/model.json` 200.
- Toolchain ML terdokumentasi: `ml/install-deps.cmd` (Python 3.11 + TF 2.21 + tfjs 4.22 via wheel lokal + retry), `ml/source/`, `ml/.env.example`, `.gitignore` (venv/wheels/cache).

## Keputusan teknis
- Struktur folder Next.js per `architecture.md` §9.1; halaman tab di `app/(tabs)/` + layout bersama yang me-render `BottomNav`.
- Tailwind v4: konfigurasi CSS-first (`@theme inline` di `globals.css`) sebagai padanan "Tailwind config" — default resmi create-next-app terkini.
- ML 100% in-browser (TF.js) — tanpa Python service; artefak (`model.json`, `*.bin`, `tokenizer.json`, `stopwords.json`, `meta.json`) diserve statis dari `public/ml/`.
- Bobot GRU Keras 3 `reset_after=true` tidak didukung TF.js → diringkas ke format Keras 2 (`b = b[0]+b[1]`, `[-1]` konvensi impl 2); parity test membuktikan numerik identik.
- Parity fixture: 4 contoh asli notebook Testing Input.ipynb + 5 sample high-confidence buatan (9 total).
- Preprocess web (`lib/ml/`) replikasi persis notebook: `[^\\w\\s]` strip → lowercase → stopwords NLTK ID (termasuk "aku", sesuai notebook) → `texts_to_sequences` → `pad_sequences(post)`, `maxlen=11` dari `input_shape` (menjawab O7 di architecture).
- Threshold "emosi tidak pasti": top-1 ternormalisasi < 0.4 (dari meta.json).

## Deviasi dari docs/design.md atau docs/architecture.md
- Tailwind config → CSS-first `@theme` (Tailwind v4 tidak lagi pakai `tailwind.config.js`); fungsional identik.
- tfjs-node (native) gagal build (butuh download libtensorflow) → parity pakai `@tensorflow/tfjs` murni-JS + CPU backend; cukup untuk gate numerik.
- Konversi bukan `tensorflowjs_converter` CLI melainkan `save_keras_model()` + `rebuild_weights.py` manual (CLI tidak support `.keras` Keras-3 dan men-drop batch-shape GRU); hasil akhir sama — TF.js layers model + bobot valid.
- Skrip utilitas (`verify_env.py`, `normalize_topology.py`, `training_nb.json`, `model_nb.json`, log `*.log`) adalah artefak kerja Sprint 1, bukan bagian arsitektur.

## Blocker / catatan untuk sprint berikutnya
- Sprint 2 (Autentikasi): isi `middleware.ts` (cek cookie JWT, redirect `/login`), bangun CI4 `apps/api` (register/login/refresh/logout + JWT httpOnly), halaman login/register Next.js + form profil.
- `fullDistribution` di UI memakai probabilitas softmax mentah (bukan ternormalisasi top-2) — konsisten dengan notebook; bar distribusi memang dapat terlihat kecil untuk kelas non-top karena softmax tajam (~100% top-1). Bukan bug.
- Model bias ke beberapa kelas (mis. teks sedih → "Terkejut" 64% di Keras); kualitas model = tanggung jawab backlog ML, bukan Sprint 1.
- Bersihkan artefak kerja (`*.log`, `training_nb.json`, `training_code.txt`, `model_nb.json`, `model_code.txt`, `verify_env.result.json`, `ml/wheels/*.whl` 350MB) sebelum commit final ATAU gitignore-kan (wheels sudah diignore).
- `apps/web/package.json` memuat `@tensorflow/tfjs-node` di devDependencies walau install-nya gagal — hapus entri itu agar `npm install` bersih di mesin lain.
- Inference pertama di browser mengunduh ~1.2MB shard + tfjs (~300KB gzip); pertimbangkan preload di Sprint 4 (journal editor).
