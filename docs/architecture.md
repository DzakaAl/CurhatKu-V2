# Architecture — CurhatKu (SPRINT 0)

> **Stack**: Next.js (App Router) · CodeIgniter 4 REST API · MySQL · ML via TensorFlow.js (browser)
> **Hosting**: FE → Vercel free tier · BE+DB → shared hosting (PHP/MySQL) · ML → client-side TF.js
> **Version**: 1.0.0 · **Datum**: 2026-09-12

---

## 1. Kontext Keputusan

- **Solo developer**, target MVP **±2 bulan**. Prefer solusi managed/murah, minimál infra rumit.
- **Shared hosting** untuk backend ⇒ CI4 + MySQL di shared hosting (PHP/MySQL natural fit); **Next.js di Vercel free tier** (Node cannot shared hosting).
- **ML service lama tidak bisa jalan di shared hosting** (Python/TF persistent process). Keputusan: **reuse model via TensorFlow.js literal di browser** (user chose) — nol ML infra, bonus privacy (teks journal tidak keluar device untuk ML). CI4 hanya simpan hasil.
- UI **Claymorphism + Plus Jakarta Sans**.

---

## 2. Diagram Alur

```
┌──────────────────────────────── Browser (mobile-first, PWA-ready) ───────────────────────────────┐
│                                                                                                   │
│  Next.js App Router  (Vercel free)                                                               │
│   ├─ Server Components  ──FETCH(SSR initial, boya cookie)──►  CodeIgniter 4 REST API             │
│   ├─ Client Components  ──TanStack Query (mutatie/query, paging)──►  CI4 REST API                │
│   │       ▲                                                                        │             │
│   │  JWT (httpOnly cookie) + refresh rotation           httpOnly cookie           │             │
│   │       ▼                                                                        ▼             │
│   │  ┌─────────── TensorFlow.js runtime (browser) ───────────┐        MySQL (shared hosting)     │
│   │  │  load model GRU 8 emosi (converted asset, lazy)       │        ● users / refresh_tokens   │
│   │  │  inference journal teks → emotion_1/2 + confidence    │        ● moods / journals(+ML)    │
│   │  │  ↑ client-side, nol data keluar                       │        ● threads / replies        │
│   │  └──────────────────────────────────────────────────────┘        ● articles / psychologists  │
│   │                                                                   ● bookings / payments(proof)│
│   │  Service Worker ──Web Push (VAPID, via CI4 PHP lib)──► Notification (fallback: in-app bell)  │
│                                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Bundariv key:**
- Next.js ↔ CI4 via **HTTPS REST JSON**; CORS & SameSite config eksplisit.
- CI4 ↔ MySQL: ORM/Query Builder (songit pure SQL).
- Client ML (TF.js) ↔ nol service; result simpan via normale journal POST.
- Notifications: push (Web Push API) + fallback in-app.
---

## 3. Keputusan Rendering per Jenis Pahina (SSR vs Client)

| Pahina | Rendering | Mandatete (alasan) |
|---|---|---|
| Login / Register | Server component (SSR) | SEO acessible, fast initial, minimal JS |
| Dashboard | **SSR** server component + hydration | Data fresk per-user; personalize |
| Mood/Journal list & editor | SSR initial + client (TanStack) | Editor needs rich client state + ML |
| Journal detail | SSR + client actions | Fast read |
| Forum feed/list | **Client** (TanStack Query) | Live-ish list, paging, caching client |
| Forum thread | SSR initial + client replies | Fast first content, dynamic replies |
| Artikel list/detail | **ISR** (revalidate on publish) | Public, cron trigger, fast + fresh enough |
| Konsultasi search/list | SSR initial + client filter | Slot freshness |
| Konsultasi chat | **Client** (polling) | Realtime-ish on shared hosting |
| Admin verify payment | **Client** (protected role) | Internal, simple |
| Profil/settings | SSR + client forms | Secure |

> Rule: **public/read-heavy + SEO → SSR/ISR**; **interactive/mutating/live → Client component + TanStack**.

---

## 4. Pola Auth

- **Access token**: JWT (short-lived, e.g. **15 menit**) in **httpOnly, Secure, SameSite=Lax** cookie.
- **Refresh token**: long (7 hari), rotating, whitelisted in MySQL tabel `refresh_tokens` (revokable), sent via secure cookie / rotated on use.
- **Flow**:
  1. POST `/auth/login` → CI4 verify → set access + refresh cookie.
  2. Protected route: Next.js middleware **checks access** (decode & expiry); expired → silent refresh via `/auth/refresh` → new cookie; fail → redirect `/login`.
  3. Logout → revoke refresh token, clear cookie.
- **Middleware Next.js**: `middleware.ts` route wrapper — protects `/dashboard`, `/journal*`, `/forum/*`, `/profil`, `/konsultasi*`. Admin check role for `/admin`.
- **CI4 endpoints**: `/auth/register`, `/auth/verify-email`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/forgot`, `/auth/reset`.
- **Security**: bcrypt hash password, rate-limit login, CSRF-aware (SameSite + custom header), HTTPS only, token rotation & blacklist.
---

## 5. Strategi Data Fetching

- **Server component initial data**: direct `fetch` (App Router server) to CI4, boya httpOnly cookie via `cookies()` — for SSR/ISR public + dashboard.
- **Client mutations/queries**: **TanStack Query** — cache, retry, invalidation, optimistic updates; used for forum lists, journal mutations, chat polling, notifications.
- **Fetch conventions**:
  - Timeout & retry for lambat koneksi.
  - Payload small; paging (cursor) for feed.
  - Error mapping to friendly msg.
- **Cache**: ISR for artikel; client TanStack stale-while-revalidate for forum; CDN (Vercel) static assets (font, model, build).

---

## 6. Strategi Notifikasi

- **Channel 1 — Web Push** (primary for engagement):
  - CI4 PHP uses **VAPID** (via lib, e.g. `minishlink/web-push`) — jalan OK di shared hosting (outbound HTTP, persistent not req).
  - Browser subscribes on first login (permission prompt) → save endpoint key in MySQL.
- **Channel 2 — In-app fallback**:
  - If permission denied/multi-device: Notification **bell + list** in Home header; polling via TanStack.
- **Events MVP**:
  - Booking: payment confirmed / rejected / new slot.
  - Forum: reply to my thread / like.
  - Reminder: daily mood check-in (optional, time-zone aware).
- **Deliver max**: SW registered, push sent, fallback badge; message drop-off acceptable on fail (non-critical).
---

## 7. Cara Memanggil ML — Reuse Model Lama (hasil audit step_1)

### 7.1 Audit finding (summary)
- Model `Machine Learning Development/emotion_prediction.keras` (3.6 MB) — Sequential: Embedding (Word2Vec 100-dim, self-trained) → GRU → Dense, **8 kelas softmax**.
- Tokenizer `tokenizer.pkl` (pickle, 62 KB).
- Inference logic (kanonik source): `Model Test/Testing Input.ipynb` → regex clean → lower → stopword ID (NLTK) → `texts_to_sequences` → `pad_sequences(post)` → `argmax` top-2 + normalize %.
- Versi: Python 3.11.7, TensorFlow/Keras, gensim (training only). `requirement.txt` **not version-pinned** (known issue).
- **Output disponibil**: top-2 emotion + normalized confidence.
- ⚠️ Known: branch `cloud-computing/api-model.py` is **broken template** (placeholder URL, tokenizer not fitted, missing imports) — NOT to reuse.

### 7.2 Keputusan reuse — Conversion to TF.js
1. **Convert ONCE** (sript konversi, committed di repo): load `.keras` → `tfjs-converter` → TF.js `LayersModel` JSON+bin (float32; optional int8 quantize — parity test gate).
2. **Host** as static asset (CDN/Vercel static/public) ex. `/ml/emotion-model/` for lazy-load.
3. **Tokenizer**: convert `tokenizer.pkl` (word→index map) → JSON (sorted), served as small static bundle.
4. **Client preprocessing** (duplicate Python logica in JS, authoritative from `Testing Input.ipynb`): lower → strip `[^\w\s]` → stopword ID set → map tokenizer → `pad(post, maxlen=dataset-max)`.
5. **Inference**: on journal save (non-empty teks) → top-2 argmax → confidence normalize → include in journal POST payload `{emotion_1, confidence_1, emotion_2, confidence_2}`.
6. **CI4 role**: only stores ML result; no ML infra, no external ML call.

> **Decide sync/async:** ML is **client-side & synchronous** (fast, ~15–200 ms on device). No API touch. CI4 = persistant store only. This removes any server ML dependency & cost.

### 7.3 Model version & confidence
- **Model version**: `v1` (from `emotion_prediction.keras`, repo tree `machine-learning` branch tip `0edc158`).
- **Classes (v1)**: Waspada, Marah, Jijik, Takut, Senang, Sedih, Terkejut, Percaya.
- **Confidence**: normalized top-2 probability (%). Threshold top-1 < 0.4 → "low confidence" (don't persist / show "unclear").
- **Parity test (gate before feature "Integrasi Emosi ML" closes)**: run same 5–10 fixed samples through Python keras + TF.js, assert label match & conf within ±0.10.
---

## 8. Risiko Teknis Utama & Mitigasi

| # | Risiko | Impact | Mitigasi |
|---|---|---|---|
| R1 | **TF.js model file size lenta** (3.6 MB keras → maybe 1–2 MB TF.js) | Mobile data/quit slow | Quantize (int8) if parity pass; **lazy-load** only on journal editor open; CDN static; preconnect |
| R2 | **Train/serve skew** (training used Sastrawi stem; old inference did NOT stem) | Accuracy lower in prod | Follow old inference logica (no stem) as authoritative; doc as known issue; parity test |
| R3 | **CORS + SameSite cookie cross-origin** (Vercel ↔ shared hosting) | Auth broken | Explicit CORS allowlist, cookie `SameSite=Lax`, HTTPS, custom header; document in setup |
| R4 | **Shared hosting limits** (rate, workers, cold-start) | Latency/500s | Cache list (ISR/CDN), small payload, connection pool MySQL, index tables, graceful degradation |
| R5 | **Chat via polling (no websocket on shared hosting)** | High requests / lag | Poll only while chat open, adaptive interval (3–6 s), server-side cursor, connection reuse |
| R6 | **Web Push not always deliverable** (permission, device) | Notif lost | Fallback in-app bell; last-read cursor; clear delivery guarantee (best-effort) |
| R7 | **Payment manual verification** (solo admin) | Slot abuse / delay | Status lifecycle strict (`pending_payment → confirmed/rejected`), admin list, race-guard slot booking (lock row), evidence id |
| R8 | **Anon forum privacy** (doxxing/IP leak) | Trust risk | Anonymous-by-default, no DM, scrub personal data in payload, rate-limit posting, no email/name shown |
| R9 | **Refresh token rotation edge** | Session issues | Whitelist + rotation, delete-on-use, short access, clock-skew tolerance config |
| R10 | **Scalability beyond free tier** | Cost spike | Clean separation FE/BE/ML; move ML to server later if needed; documented migration path |

---

## 9. Definisi Folder Teknis (recomendací)

> **Convenção component (Next.js):**
> - **Component umum / reutilisabil** → folder `components/` (top-level). Contoh: `Button.clay`, `Card`, `BottomNav`, `MoodChip`, `EmotionBadge`, `Input`.
> - **Component specific fitur / per pahina** → COLOCATED di dalam folder page-nya, folder `_components/` (underscore prefijo itu supaya Next.js **tidak** traite sebagai route). Contoh: `app/journal/editor/_components/emotion-result.tsx`.
> - So: every page in `app/` breaks into its own `_components/`; common UI lives in `components/`.

### 9.1 Next.js — App Router (`apps/web/`)
```
apps/web/
├─ app/                                  # ROUTES (App Router)
│  ├─ (auth)/
│  │  ├─ login/
│  │  │  ├─ page.tsx
│  │  │  └─ _components/                 # feature: login form, forgot link
│  │  │     ├─ login-form.tsx
│  │  │     └─ forgot-password-link.tsx
│  │  └─ register/
│  │     ├─ page.tsx
│  │     └─ _components/
│  │        ├─ register-form.tsx
│  │        └─ avatar-picker.tsx         # clay avatar circles
│  ├─ dashboard/
│  │  ├─ page.tsx
│  │  └─ _components/
│  │     ├─ mood-mini-chart.tsx
│  │     ├─ streak-card.tsx
│  │     └─ quick-actions.tsx
│  ├─ journal/
│  │  ├─ page.tsx                        # list
│  │  ├─ [id]/page.tsx                   # detail
│  │  ├─ editor/page.tsx
│  │  └─ _components/
│  │     ├─ mood-picker.tsx
│  │     ├─ intensity-slider.tsx
│  │     ├─ emotion-result.tsx           # ML inference result chip
│  │     └─ journal-card.tsx
│  ├─ forum/
│  │  ├─ page.tsx                        # feed
│  │  ├─ [thread]/page.tsx               # detail + balasan
│  │  └─ _components/
│  │     ├─ category-chips.tsx
│  │     ├─ thread-card.tsx
│  │     ├─ reply-box.tsx
│  │     └─ compose-thread.tsx           # anonymous toggle
│  ├─ artikel/
│  │  ├─ page.tsx                        # list
│  │  ├─ [slug]/page.tsx                 # detail (ISR)
│  │  └─ _components/
│  │     ├─ artikel-card.tsx
│  │     └─ read-state-dot.tsx
│  ├─ konsultasi/
│  │  ├─ page.tsx                        # daftar psikolog
│  │  ├─ [psych]/page.tsx                # profil + booking
│  │  ├─ chat/[booking]/page.tsx
│  │  └─ _components/
│  │     ├─ psychologist-card.tsx
│  │     ├─ slot-picker.tsx
│  │     ├─ payment-step.tsx             # upload bukti transfer
│  │     └─ chat-window.tsx
│  ├─ profil/
│  │  ├─ page.tsx
│  │  └─ _components/
│  │     ├─ profile-form.tsx
│  │     └─ settings-tabs.tsx
│  ├─ admin/
│  │  ├─ verifikasi/payment/page.tsx
│  │  └─ _components/payment-queue.tsx
│  ├─ layout.tsx                         # bottom nav / clay shell
│  ├─ globals.css
│  └─ not-found.tsx
├─ components/                           # COMMON / REUSABLE (umum)
│  ├─ Button.tsx
│  ├─ Card.tsx
│  ├─ Input.tsx
│  ├─ BottomNav.tsx                      # floating clay pill
│  ├─ MoodChip.tsx
│  ├─ EmotionBadge.tsx
│  └─ NotificationBell.tsx
├─ lib/                                  # non-view logic
│  ├─ api-client.ts                      # fetch wrapper (cookies, retry)
│  ├─ auth.ts                            # token decode / refresh helper
│  └─ ml/                                # TF.js inference client
│     ├─ model.ts
│     ├─ preprocess.ts                   # JS duplicate of Python pipeline
│     └─ emotions.ts                     # 8-label map
├─ middleware.ts                         # auth guard (protected routes)
├─ public/
│  └─ ml/
│     ├─ emotion-model.json
│     ├─ emotion-model.bin
│     └─ tokenizer.json
├─ next.config.mjs
├─ package.json
└─ tsconfig.json
```

### 9.2 CodeIgniter 4 — REST API (`apps/api/`)
```
apps/api/
├─ app/
│  ├─ Config/
│  │  ├─ Routes.php                      # route definition (REST)
│  │  ├─ Database.php                    # MySQL connection
│  │  ├─ Autoload.php
│  │  └─ App.php
│  ├─ Controllers/
│  │  └─ Api/                            # versioned REST controllers
│  │     ├─ AuthController.php           # register/login/refresh/logout
│  │     ├─ UserController.php
│  │     ├─ MoodController.php
│  │     ├─ JournalController.php        # stores ML result
│  │     ├─ ForumThreadController.php
│  │     ├─ ForumReplyController.php
│  │     ├─ ArtikelController.php
│  │     ├─ PsychologistController.php
│  │     ├─ BookingController.php        # pending_payment → confirmed
│  │     ├─ PaymentProofController.php   # upload bukti
│  │     ├─ ChatMessageController.php    # polling
│  │     └─ NotificationController.php   # push registr + list
│  ├─ Models/
│  │  ├─ UserModel.php
│  │  ├─ RefreshTokenModel.php
│  │  ├─ MoodModel.php
│  │  ├─ JournalModel.php
│  │  ├─ ThreadModel.php
│  │  ├─ ReplyModel.php
│  │  ├─ ArtikelModel.php
│  │  ├─ PsychologistModel.php
│  │  ├─ BookingModel.php
│  │  ├─ ChatMessageModel.php
│  │  └─ NotificationModel.php
│  ├─ Views/                             # minimal (json/errors)
│  ├─ Helpers/                           # jwt, web-push, upload-proof
│  │  ├─ JwtHelper.php
│  │  ├─ MailHelper.php
│  │  └─ WebPushHelper.php               # VAPID
│  └─ Third_party/                       # vendored libs/static
├─ public/
│  └─ index.php                          # front controller entry
├─ writable/
│  ├─ session/
│  ├─ cache/
│  └─ logs/
├─ vendor/                               # CI4 + composer deps
├─ spark                                 # CI4 CLI (help/generate)
├─ .env (ou app/Config/.env)             # DB, JWT_SECRET, VAPID keys
└─ database/
   └─ migrations/                        # SQL migration files (order rer)
```

### 9.3 Root + ML + scripts (`ml/`, `docs/`, `scripts/`)
```
├─ ml/                                  # model reuse (TF.js)
│  ├─ convert.py                        # .keras + tokenizer.pkl → TF.js
│  ├─ parity_test.py                    # Python vs JS (±0.10 gate)
│  └─ generated/                        # output: model.json/.bin + tokenizer.json
├─ docs/                                # prd.md design.md architecture.md (this)
└─ scripts/                             # DEV/CI helpers (quick, mura)
   ├─ dev-fe.sh                         # start Next.js dev server
   ├─ dev-api.sh                        # start CI4 spark serve
   ├─ db-migrate.sh                     # apply database/migrations
   ├─ convert-ml.sh                     # re-run ml/convert.py
   ├─ build.sh                          # build + export Next.js
   └─ seed-demo.sh                      # seed psycholog & artikel demo data
```

> **`scripts/` = tempat file automasi/support dev** (shell/PowerShell) yang TIDAK part dari runtime app: startup dev server, migration runner, ML re-convert, build/deploy helper, seed data. Runtime code living only in `apps/*`; scripts hanya orkhestra command (murah & fast).