# Sprint 02 — Penyelesaian MVP (M1–M7+)

## Selesai
- **Bug kritis auth**: firebase/jwt menolak kunci HS256 < 32 byte → register/login crash pada `.env` default. `Auth::secret()` kini menurunkan kunci 32 byte (SHA-256) dari `jwt.secret`; di produksi secret kosong/default/<32 karakter ditolak.
- **Web Push (M7+)**: tabel `push_subscriptions`, `App\Libraries\Push` (minishlink/web-push, VAPID), endpoint `GET /api/push/key`, `POST /api/push/subscribe|unsubscribe`. `Notify::send()` otomatis mengirim push bila VAPID terisi; tanpa kunci → fallback in-app saja.
- **Frontend push**: `public/sw.js` (push + klik notifikasi membuka tautan), `lib/push.ts`, toggle "Notifikasi push" di Profil.
- **Pengingat mood**: `php spark mood:remind` (idempoten per hari, lewati user yang sudah check-in). Cron: `0 19 * * * cd /path/api && php spark mood:remind`.
- **Kunci VAPID**: `php spark push:keys`.
- **Test suite API** `tests/feature/ApiFlowTest.php` (SQLite in-memory): auth, mood/journal/dashboard, forum anonim + notif, artikel, booking → verifikasi admin → chat, push subscribe. `vendor/bin/phpunit` → 12 tes lulus.
- Artefak kerja Sprint 1 (`*_nb.json`, `*_code.txt`) dihapus dari repo.

## Catatan
- Upload bukti transfer (multipart) belum dicakup tes otomatis — uji manual.
- Web Push butuh HTTPS di produksi (localhost dikecualikan browser).

## Rebranding visual "Teduh" (nama tetap CurhatKu)
- Palet: lavender/ungu → kertas pasir `#f7f3ec`, tinta hutan `#1c2a26`, aksen teal `#1f5c54` (gelap: `#111917` + mint `#8fd3c2`). Warna emosi tidak diubah.
- Tipografi: Plus Jakarta Sans (isi, sesuai D10) + Fraunces (judul h1/h2, `font-display`).
- Logo baru `app/icon.svg` / `public/logo.svg` (daun = gelembung cerita), `favicon.ico` lama dihapus, `manifest.webmanifest` ditambahkan, wordmark di halaman auth.
- Proxy tidak lagi mengalihkan `sw.js`, ikon, & manifest ke `/masuk`.
