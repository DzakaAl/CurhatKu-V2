# Sprint 0 — Audit & Scope (CurhatKu)

> **Mengumpul**: keputusan & keputusan terbuka dari Sprint 0.
> **Version**: 1.0.0 · **Datum**: 2026-09-12

---

## 1. Audit ML — Repo Lama (`DzakaAl/CurhatKu`)

### 1.1 Modul yang dipakai ulang (branch `machine-learning`, tip `0edc158`)
| Artefak | Path | Ukuran | Fungsi |
|---|---|---|---|
| Model GRU | `Machine Learning Development/emotion_prediction.keras` | 3.6 MB | Prediksi emosi 8 kelas |
| Tokenizer | `Machine Learning Development/tokenizer.pkl` | 62 KB | Word2Index mapping |
| Inferensi kanonik | `.../Model Test/Testing Input.ipynb` | — | Logika preprocess+predict top-2 |
| Notebook training | `.../RNN_GRU_Word2Vec.ipynb` | — | Referensi arsitektur |
| Dataset | `.../Dataset/data.csv` | 342 KB | Corpus Indonesia |

### 1.2 Detail teknis
- Arsitektur: Sequential — Embedding (Word2Vec 100-dim self-trained) → GRU → Dense, 8 kelas softmax.
- Label (Plutchik, Indonesia): Waspada, Marah, Jijik, Takut, Senang, Sedih, Terkejut, Percaya.
- Preprocess inferensi: lower → strip `[^\w\s]` → stopword NLTK ID → tokenizer → pad.
- Runtime: Python 3.11.7, TensorFlow/Keras; inference ~15–200 ms.
- Output: top-1 + top-2 emotion + confidence normalized %.

### 1.3 Issues gendana
1. **`cloud-computing/api-model.py` rusak** (template): MODEL_URL placeholder, import nltk hiang, tokenizer tidak fit → output sampah. **NOT dipakai.**
2. **Train-serve skew**: training menggunakan **Sastrawi stemming**, inferensi lama **tidak** → kemungkinan akurasi produksi < training.
3. `requirement.txt` **tidak pin versi** dependency.
4. `pad_sequences` tanpa `maxlen` eksplisit (ikuti panjang max dataset) → perlu pin saat serving.

### 1.4 Mode & confidence
- **Model version**: `v1` (emotion_prediction.keras, branch `machine-learning`).
- Confidence: normalized top-2 (%). Threshold top-1 < 0.4 → "low confidence".

---

## 2. Keputusan Arsitektur (Sprint 0)

| # | Topik | Keputusan | Alasan |
|---|---|---|---|
| D1 | Frontend | **Next.js (App Router)**, deploy **Vercel free tier** | Shared hosting tidak bisa Node; per-user SSR, ISR |
| D2 | Backend | **CodeIgniter 4 REST API** + **MySQL** di **shared hosting** | PHP/MySQL natural fit, murah |
| D3 | **ML serving** | **TF.js di browser** (model `.keras`+`tokenizer.pkl` → konversi sekali) | Shared hosting tidak bisa Python/TF persistent; nol infra ML; privasi teks journal tidak keluar |
| D4 | Reuse ML | Reuse artifact + logic inferensi `Testing Input.ipynb`; ikuti behavior lama (no stem) | İkuti sen kanonik; doc known-issue |
| D5 | Auth | JWT access (httpOnly cookie, 15 min) + refresh rotation (7 hari whitelist MySQL) | Secure stateless persis shared hosting |
| D6 | Data fetching | SSR fetch initial + TanStack Query (mutations/query/polling); Artikel = ISR | Perf + UX |
| D7 | Notifikasi | Web Push (VAPID, PHP lib) + fallback in-app bell | Workable di shared hosting outbound |
| D8 | Forum | Anonymous-by-default, tanpa DM | Privacy/comunit |
| D9 | Konsultasi | Booking + bayar manual (upload bukti → admin verifies) + chat polling | Tidak butuh infra rumit/payment gateway |
| D10 | UI | **Claymorphism** + **Plus Jakarta Sans** | Lembut, ramah, mobile-friendly |
| D11 | Navigasi | **Bottom nav** (floating clay pill, 5 tab) | One-hand reach mobile |

---

## 3. Keputusan Ini Masih Terbukah (open)

| # | Topik | Pertanyaan | Owner / Note |
|---|---|---|---|
| O1 | **SMTP/email** (verifikasi akun) | Penyedia email transaksional apa (e.g. shared hosting mail, Mailgun/SES free tier 100/day)? | Decide at Auth sprint |
| O2 | **TF.js quantization** (float32 vs int8) | Potenziale reduce model size 1–2 MB; hanya jika parity ±0.10 pass | Gated by parity test (ML sprint) |
| O3 | **Seed data psikolog** | Manual insert admin for MVP? source? | Decide at Konsultasi sprint |
| O4 | **Warna final palet** | Hex draft approved; final polish pigtail design refinement | Verify at first FE sprint |
| O5 | **maxlen padding** | Value exact dari dataset (na-check during conversion script) | ML sprint |
| O6 | **Threshold confidence final** | <0.4 provisional; validate on JS parity + real samples | ML sprint |
| O7 | **Admin role auth** | Role flag simple (`users.role=admin`) ok MVP? | Auth sprint |

---

## 4. Referensi Dokumen Fondasi
- `docs/prd.md` — scope fitur MVP & Fase 2, sukses kriteria.
- `docs/design.md` — design system claymorphism, mobile-first, wireframes.
- `docs/architecture.md` — stack, alur, auth, data, notif, ML reuse, risiko.

> Catatan: semua keputusan di file ini MIRROR di dokumen fondasi. Perubahan scope = edit `docs/prd.md` / `docs/design.md` / `docs/architecture.md` DULU, lalu update section ini.