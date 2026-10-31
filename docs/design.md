# Design — CurhatKu (SPRINT 0)

> **Tema**: Claymorphism · **Font**: Plus Jakarta Sans · **Principle**: Mobile-first
> **Version**: 1.0.0 · **Datum**: 2026-09-12

---

## 1. Design System

### 1.1 Design language: Claymorphism
Permukaan seperti **clay puffy** (lembut, taktil, ramah). Signature look:
- Kartu/button boupend & puffy, bukan flat.
- **Radius besar**: 12 / 16 / 24 / 32 / full.
- **Shadow ganda** (raised): inner highlight atas + drop shadow berwarna (tinted, bukan hitam) bawah.
- **Pressed state**: saat ditekan, inset shadow dibalik (kesan "clay menyempit").
- Background lembut gradien pastel; kartu lebih terang atas.

### 1.2 Palet warna
| Token | Hex | Fungsi |
|---|---|---|
| `bg-base` | `#F4F1FB` | Background app (lavender-krem muda) |
| `primary` | `#8B7CF6` | CTA, brand, tab aktif |
| `primary-soft` | `#A99BF9` | Hover/active tint |
| `ink` | `#2E2A3E` | SEMUA teks (charcoal-violet gelap) |
| `ink-muted` | `#6B6478` | Secondary teks |
| `surface` | `#FFFFFF`/`#FBF9FF` | Kartu / input |
| `accent-warm` | `#FFC79B` | Highlight lembut, badge dukungan |

**Mood palette (8 emosi — clay chips/kartu):**
| Emosi | Hex (pastel clay) |
|---|---|
| Senang 😊 | `#FFD97D` |
| Percaya 😌 | `#A5DCB5` |
| Sedih 😢 | `#9BB8E8` |
| Marah 😠 | `#FF9B9B` |
| Takut 😨 | `#C9B4E8` |
| Jijik 😖 | `#C5D8A0` |
| Terkejut 😲 | `#FFB3C8` |
| Waspada 😒 | `#FFC79B` |

Warna emosi berlaku elemen besar (chip/kartu/badge), tidak untuk teks kecil.

### 1.3 Tipografia — Plus Jakarta Sans
- **Font-family**: `"Plus Jakarta Sans"` (heading ExtraBold/Bold; body Regular/Medium).
- Load via `next/font/google` → **self-host saat build** (nol request runtime; aman di koneksi lambat), `display: swap`.
- Fallback stack: `"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif`.
- **Type scale** (px, mobile): `12 / 14 / 16 / 18 / 20 / 24 / 30` — display 30, h1 24, h2 20, h3 18, body 16, caption 14, label 12.
- Line-height: body 1.5, heading 1.2. Letter-spacing: normal di body; heading slightly tight.

### 1.4 Spacing & Layout scale
- **Spacing** (base 4pt): `4 / 8 / 12 / 16 / 24 / 32 / 48`.
- Container mobile max-width: **480px**; section padding h-left 16px, vertical rhythm 24px.
- **Grid**: 2-col grid untuk mood chips; list cards full-width mobile.

### 1.5 Tokens clay — shadow & radius
```
--radius-sm: 12px;  --radius-md: 16px;  --radius-lg: 24px;  --radius-xl: 32px;  --radius-full: 999px

--clay-raised:
  box-shadow: inset 4px 4px 8px rgba(255,255,255,.65),
              inset -4px -4px 8px rgba(46,42,62,.06),
              10px 10px 24px rgba(139,124,246,.18);   /* tinted, bukan hitam */

--clay-pressed (state tolka-activ):
  box-shadow: inset 6px 6px 12px rgba(46,42,62,.10),
              inset -6px -6px 12px rgba(255,255,255,.55);

--clay-inset (input field / sunken):
  box-shadow: inset 4px 4px 8px rgba(255,255,255,.50),
              inset -4px -4px 8px rgba(46,42,62,.14);
```

### 1.6 Komponen key bergaya clay
| Komponen | Gaya |
|---|---|
| **Bottom nav** | Floating clay pill (rounded-full, melayang), tab aktif "naik" dengan clay shadow |
| **Button primary** | Puffy clay, hover/press → clay-pressed |
| **Mood chips** | Clay bubbles pastel per emosi; state selected = pressed + check |
| **Input** | `--clay-inset` (sunken clay), label eksplisit, fokus outline clear |
| **Card** | Raised clay, radius-lg, tap ripple soft |
| **Badge/notification** | Clay dot/indicator, accent-warm |
---

## 2. Prinsip Mobile-First

1. **Base breakpoint mobile (360px)** — semua desain didesain di mobile DULU.
2. Scale ke tablet (768px) & desktop (1024px+) ONLY penambahan, bukan redesign.
3. Desktop = **max-width container** (midden content), component tetap mobile-based scale.
4. Performance-first: sistema mobile, asset lazy, quantize model, font self-host.
5. Breakpoint strategy:
   - `base (mobile)`: layout single-column, bottom nav.
   - `@md (≥768px)`: grid boleh 2–3 col (feed, kartu), nav boleh shift hamburger/sidebar (secondary only).
   - `@lg (≥1024px)`: max-width 1200px, spacing scaleup, sidebar optional.

---

## 3. Pola Navigasi

**LOSE: Bottom navigation (floating clay pill)** — bukan hamburger.

**Alasan:**
- **One-hand reach on mobile** — thumb selalu di area bawah; bottom nav selalu terlihat tanpa tap.
- App kesehatan mental = repetitive mobility common; bottom nav jadi home base flawess.
- Hamburger ma kanske konceal fitur important besar; bottom nav boost discoverability & tap faster.
- Hamburger digunakan hanya untuk **secondary action** (filter, pengaturan, help) di top-right.

**Bottom nav — 5 tab (< 6 agar fit 360px):**
1. **Home** (`/dashboard`)
2. **Mood & Journal** (`/journal`) — aktif saat tulis
3. **Forum** (`/forum`)
4. **Artikel** (`/artikel`)
5. **Profil** (`/profil`)

> Konsultasi tidak tab utama (6 tab terlalu sempit) — masuk via **Home** card / **Profil** shortcut. Notification icon (in-app) di Home header + push permission prompt.
---

## 4. Aturan Aksesibilitas Dasar

1. **Tap target minimal 44×44px** — semua clickable (btn, chip, nav, icon). Clay besar dorong croceck.
2. **Kontras warna WCAG AA** — teks ≥ 4.5:1 (kecil) / ≥ 3:1 (large). **Teks selalu `ink` gelap; tidak pernah teks putih di atas pastel muda.**
3. **Hindari interaksi hover-only** — semua action ada versi tap (press/down). Hover only enhancement, never required.
4. **Mood warna bukan satu-satunya signal** — konĵug complement icon emoji + label (emoji 😊😢…) supaya daltonism.
5. **Focus keyboard terlihat** — outline eksplisit (untuk tidak ka depender hanya box-shadow clay).
6. **Form label eksplisit** — bukan placeholder-only; error atributed & readable.
7. **Reduced motion**: respect `prefers-reduced-motion` — animasi clay minimal/disable.
8. **Pseudo button consistency** & aria-label for icon buttons.
---

## 5. Referensi Layout per Fitur MVP (wireframe tekstual)

### 5.1 Auth (Login / Register)
```
[Header: logo CurhatKu + tagline]
[ Clay card centered ]
  [ Input email .......... ]     ← inset clay
  [ Input password ........ ]
  [ Button primary: Log In ]      ← clay puffy
  [ Link: Forgot password? ]
  [ Divider — "Bisu baru?" ]
  [ Button outline: Register ]
[Footer: privacy note]
Priority: form fields → CTA → recover/register links.
```

### 5.2 Register + Onboarding (optional)
```
Logo
[Input nama][Input email][Input password][Input confirm]
[Button: Create account]
→ [Onboarding step]: pick avatar (clay circles) → pick preference mood chips
```
Priority: identity fields → avatar pick → mood pref.

### 5.3 Dashboard (Home) — mobile order
```
[Header: greeting + notification bell]
[Card: 3-day mood mini-chart (clay bars)]
[Card: Streak card "12 hari journal ✈ streak"]
[Card: Last journal summary + emotion label]
[Quick actions row: + Mood · + Journal · Forum]
[Shortcut card: Konsultasi Psikolog →]
```
Priority: greeting → mood chart → streak → quick action → konsultasi shortcut.

### 5.4 Mood Entry
```
[Header: "Kamu merasa bagaimana?"]
[Grid 2-col mood chips (8 emosi, clay bubbles + emoji)]
[Optional: intensity slider (1–5) + note field]
[Button: Save mood]
→ feedback toast "Mood saved, thanks!"
```
Priority: chips → slider → save.

### 5.5 Journal — List
```
[Header + new-entry FAB (clay +)]
[List cards, month-grouped]
  Card: date · mood chip small · preview text (2 lines) · emotion tag badge
[Empty state illustration + CTA "Tulis first journal"]
```
Priority: new FAB → cards newest-first · emotion badge.

### 5.6 Journal — Editor (ML inference live)
```
[Header back + "New entry"]
[Title input]
[Textarea (main) — NON-empty triggers ML on save]
[Emotion result chip area (updates after inference):
   "Deteksi: Senang 😊 78% · Sedih 😢 15%"]
[Button: Save (enabled when title OR text non-empty)]
```
Priority: textarea → emotion result → save.

### 5.7 Journal — Detail
```
[Back]
[Title (h2)]
[Date + mood chip + emotion tag badge]
[Body text]
[Actions: Edit / Delete]
```
Priority: content → mood/emotion meta → actions.
### 5.8 Forum — Feed
```
[Header: "Forum" + search/filter icon]
[Category chips row (horizontal scroll): Semua · Ankskieti · Depresia · Stres · Relasi · Lain]
[Thread cards]
  Card: title · snippet · anonymous handle (teal small) · likes/replies count · time ago
[Compose FAB (clay +) → open compose]
```
Priority: category chips → thread cards → compose FAB.

### 5.9 Forum — Thread detail & Compose
```
Detail:
[Back to feed]
[Title + body + anonymous user]
[Like button + counts]
[Replies list (nested, simple)]
[Reply input + send]
Priority: content → replies → reply box.

Compose — fader ka modal:
[Category select chips][Title input][Body textarea][Anonymous toggle (default ON)]
[Button: Publish]
```

### 5.10 Artikel — List & Detail
```
List:
[Header: "Artikel"]
[Category chips / search]
[Card list: thumb · title · read time · read/unread dot]
Detali:
[Back][Heading][Meta (category · date · read time)][Image][Body]
[Back to list + "Read" status mark]
```
Priority list: search → category → cards; detail: heading → meta → body.
### 5.11 Konsultasi — Daftar Psikolog
```
[Header back "Konsultasi"]
[Subheader: nearby / recommended]
[Psychologist cards]
  Card: avatar (clay) · name · specialty · rating · price · next-free-slot
[Tap → profile/booking]
Priority: cards → tap → booking.
```

### 5.12 Konsultasi — Profil psikolog + Booking
```
Profil:
[Avatar][Name + credential][Bio+specialty][Rating + review count]
[Slot picker: list free days/times (clay chips)][Selected slot highlighted]
[Booking CTA: "Booking & Bayar"]
→ Payment step:
[Instruction transfer (bank account number)]
[Upload bukti bayar (image/document)]
[Button: Submit booking]
Priority: credentials → slots → payment → submit.
```

### 5.13 Konsultasi — Chat 1-to-1
```
[Header: psychologist name + status dot (online/offline) + end-session timer]
[Message bubbles (clay): user right tinted, psych left muted]
[Typing indicator (optional)]
[Input + send]
[Top info chip: session ends {"hh:mm"}]
```
Priority: header status → messages → input.

### 5.14 Profil / Settings
```
[Avatar + edit icon][Name + email][Tabs: Account | Privacy | Notification]
Account: edit name/avatar/bio · change password
Privacy: data export · delete account
Notification: push permission toggle · in-app notif list link]
```
Priority: profile header → account → privacy → notification.

### 5.15 Admin — Verifikasi Pembayaran (minimal)
```
[Header: "Admin: Konsultasi"]
[Pending list: booking · user · psychologist · slot · uploaded proof (thumbnail)]
[Approve / Reject buttons]
[Statuses: pending_payment → confirmed / rejected]
```
Priority: pending queue → proof preview → approve/reject.