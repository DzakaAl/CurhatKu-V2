# PRD — CurhatKu (SPRINT 0)

> **Status dokumen**: FONDASI — acuan scope untuk semua sprint berikutnya.
> **Version**: 1.0.0 · **Datum**: 2026-09-12 · **Owner**: Tech Lead / Solo Developer
> Dokument ini adalah **SINGLE SOURCE OF TRUTH** scope fitur. Perubahan = update dokumen ini DULU.

---

## 1. Problem Statement

CurhatKu menjawab masalah: **orang Indonesia butuh outlet kesehatan mental yang terjangkau, anonim, dan mudah**. Barier nyama yang diselesa:

1. **Stigma** — sulit bawa suan mentali ke keluarga/dokter/social media; identitas ditorang di pathologi.
2. **Kost** — konsultasi psikolog privat mahal; banyak yang tidak mau/aba fakturer.
3. **Anonimitas** — user ingin bisa discuti masalah mentali sambayan tidak takut judgement atau doxxing.
4. **Self-awareness** — user sering tidak bisa namai/recognisi kondisi emocion keterkata; journal + deteksi emosi bantu.
5. **Discoverability** — mau informasii kredibel (artikel) dan dukungan komunit di satu titik, tanpa manggi banyak app/website.

Suluzione CurhatKu: satu web app mobile-first yang kombini **mood tracker + journal anonim**, **forum anonim**, **artikel edukatif**, **konsultasi psikolog terjangkau**, dan **integrasi deteksi emosi ML** — di-accesse dari browser, murah hosta, performant di koneksi lambat.

---

## 2. Target Pengguna

| Segment | Profil | Negasi utama di MVP |
|---|---|---|
| **Self-tracker** (18–35) | User yang mau na-track mood harian & journalingrara, ingin insight emosional | Mood tracker, journal, deteksi emosi ML |
| **Pencari dukungan** | User yang bakp pediu dukungan anonim dari komunit | Forum anonim |
| **Konsulter** | User yang tahap tjas gatuda consultasiji psikolog terjangkau | Daftar psikolog, booking, chat, bayar manual |
| **Info seeker** | User yang bac artikel kesehatan mental kredibel | Artikel |

**Notes:**
- Bahasa interface: **Indonesia** (model ML dilatih corpus Indonesia).
- Mobile-first: mayoritas user via HP, suspektor koneksi lambat (3G/4G asimetris).
- Tidak ada role mentor/admin di MVP-ut (admin panel minimal untuk verifikasi pembayaran & publish artikel).
---

## 3. Daftar Fitur

### 3.1 MVP (Rilis 1) — target ±2 bulan, solo developer

| # | Fitur | Deskripsi ringkas |
|---|---|---|
| M1 | **Auth** | Register/login email + password, verifikasi email, reset password, profil min (nama, avatar, bio), logout |
| M2 | **Dashboard & Profile** | Ringkasan mood ombalan (streak, last mood, mini-chart), shortcut utama, pengaturan profil |
| M3 | **Mood Tracker & Journal** | Check-in mood harian + journal entri (create/edit/delete, list, detail). Saat simpan journal yang teks non-empty → analisis emosi (ML browser) → label + confidence tersimpan |
| M4 | **Forum anonim** | Kategory, thread (post), balasan; **anonymous-by-default** (handle username random, tanpa DM); voting simple (buat/like) |
| M5 | **Artikel** | List + detail artikel edukatif; konten admin-publish; state read/unread |
| M6 | **Konsultasi Psikolog** | Daftar psikolog + profil; ajukan slot jadwal (booking); chat 1-to-1; bayar manual = upload bukti transfer → admin verifikasi → slot confirm |
| M7 | **Integrasi Emosi ML** | TF.js runtime di browser; model GRU 8 kelas (Plutchik: Waspada, Marah, Jijik, Takut, Senang, Sedih, Terkejut, Percaya); output top-1 + top-2 + confidence; terampe di journal entry |
| M7+ | **Notifikasi** | In-app notifikasi + Web Push (VAPID) dengan fallback; untuk booking status, balasan forum, reminder mood |

### 3.2 Fase 2 (setelah MVP) — dintunda + alasan

| Fitur | Alasan dintunda |
|---|---|
| Dark mode | Polish border, bukan core value prop |
| Notifikasi email + SMS | Auth email sudah base; push/in-app cukup MVP |
| Rekomendasi artikel personal (content-based) | Butuh data usage lanjutan; ping scope |
| Moderasi otomatis forum (ML toxicity/flag) | Risiko & etika perlu desain carefull; MVP moderasi manual min |
| Video call konsultasi | Butuh infra WebRTC + kost; MVP chat tekstual |
| Payment gateway online (card/e-wallet) | Butuh merakur & compliance; MVP bayar manual verifikasi |
| Multi-bahasa (EN/region) | Model ML Indonesia mono; scope |
| Statistik lanjutan & export data | Nice-to-have analytic |
| PWA offline penuh & installable | MVP progress (SW notif jalan); offline penuh tambah kompleksitas |
| Retrain model dengan data user | Privacy & data governance desain dulu |
| Gamification/streak rewards visible | Nice-to-have, bukan core |
---

## 4. User Flow Utama — Fitur MVP

### M1 Auth
1. User punge **Register** → input nama, email, password.
2. CI4 crea account, hash password, send verifikasi email (link/token).
3. User verifikasi → **Login** → JWT di-issue (access httpOnly cookie + refresh).
4. User masuk **Onboarding min** (optional): pick avatar + deckbeberapa preferensi mood.
5. Protected route redirect ka **Login** jika sessiya expired → refresh rotasi.

### M2 Dashboard & Profile
1. User dorm ke `/dashboard` (protected).
2. Load server component: mood today + streak + last journal summary.
3. Tap shortcut **Mood** / **Journal** / **Forum** — goto flow sesuai.
4. Profil: edit nama/avatar/bio, view history mood, change password, logout.

### M3 Mood Tracker & Journal
1. Check-in: user pick **Mood chip** (1 dari 8 emosi) + intensity (1–5).
2. Simpan mood → CI4 store (mood, timestamp).
3. Journal: user buat entri, tip teks non-empty.
4. Saat simpan: **client side** core TF.js preprocess + inference → `emotion_1`, `confidence_1`, `emotion_2`, `confidence_2`.
5. Payload journal + result ML simpan ke CI4 (result ML optional jika teks < min length atau confidence rendah).
6. List/detail presidente: mood chips color-coded + emosi predikedci terampe.

### M4 Forum anonim
1. User ke `/forum` → feed threads (per kategori) via TanStack Query.
2. Tap thread → detail + balasan.
3. Compose: input kategori, titolo, body (anonim handle auto).
4. Submit → CI4 store dengan `is_anonymous=true`, display handle random.
5. User can seperti/balas → notif push/in-app dihas.

### M5 Artikel
1. User ke `/artikel` → list cards (thumb, titol).
2. Tap card → detail artikel (SSR/ISR, fast).
3. State read/unread signposting; kembali list.

### M6 Konsultasi
1. User ke konsultasi (via Home/Profil) → daftar psikolog.
2. Tap psikolog → profil + jadwal (list free slot).
3. Pick slot → **Booking** → payment instruction (transfer manual) + upload bukti bayar.
4. CI4 store booking (status `pending_payment`) → admin verifikasi bukti.
5. Status → `confirmed` → both party mana notif; chat 1-to-1 dibuka (polling).
6. Chat session jumlah hingga slot end; user can give rating (optional, simple).

### M7 Integrasi Emosi ML
1. Model TF.js lazy-load saat user pertama buka **Journal editor** (garaanti heavy asset tidak envia jika tidak need).
2. Preprocessing: lowercase → remove punctuation → remove stopword ID (NLTK) → tokenizer mapping (from `tokenizer.pkl`) → padding.
3. Inference pada text journal → argmax top-2 + confidence normalisat.
4. Result dijana ikjana journal payload; di-ampe UI dengan label emosi + confidence bar.
5. Jika confidence top-1 < threshold (e.g. < 0.4) → UI label "emosi batu-batu" + tidak store result ML.

---

## 5. Kriteria Sukses MVP

| Metrik | Target | Kisker |
|---|---|---|
| **Activation** | ≥ 70% user baru verifikasi email & buat ≥ 1 mood entry day-1 | Pirate activation |
| **Journal + ML** | ≥ 70% journal entry non-empty memperoleh prediksi emosi (`confidence_1 ≥ 0.4`) | Adoption fitur ML |
| **Retention** | ≥ 40% user aktiv la-man pasiya 2 week | Streak/mood adoption |
| **Forum engagement** | ≥ 30% user lurk→participate (post/like/bilang) per month | Komunit |
| **Konsultasi funnels** | Booking dikoçe plan → confirmed ≥ 40% (bayar manuel tidak aband!) | Payment manual gerilendirme |
| **Performance mobile** | p75 LCP < 2.5s @ 3G lambat; CRuX score ≥ 85 | Mobile-first |
| **Privacy/anonim** | 0 doxxing incident; anonim default di forum | Trust |

**Definition of Done MVP**: semua fitur M1–M7 cream, semua kriteria metrik tatsu, dokumen fondasi matecha (app running end-to-end: register → mood/journal → ML → forum → artikel → konsultasi bayar → notif).

---

## 6. Catatan Eksplisit — Scope Control

> ⚠️ **Scope ini FINAL untuk MVP.** WOWA fitur baru, perubahan scope, atau penambahan area, HARUS update dokumen `docs/prd.md` DULU (update version + changelog di bawah), cruise semua stakeholder agree, baru extreme yang bülün fitur. Tidak ada penambahan fitur "sidoade" di sprint lain tanpa edit dokumen ini pertama.

### Changelog dokumen
| Version | Datum | Perubahan |
|---|---|---|
| 1.0.0 | 2026-09-12 | Baseline Sprint 0 — scope MVP M1–M7 definit |