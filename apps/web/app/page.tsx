import Link from "next/link";
import type { ReactNode } from "react";
import { LogoMark, Wordmark } from "@/components/brand/Logo";
import EmotionDemo from "@/components/landing/EmotionDemo";
import FeelCycle from "@/components/landing/FeelCycle";
import River from "@/components/landing/River";
import { Icon, type IconName } from "@/components/nav/icons";
import { rupiah } from "@/components/ui/States";
import { API_BASE_URL } from "@/lib/api/client";

/* Landing publik: tipografis, minim kartu, lebar isi dibatasi 1200px, tiap bagian setinggi satu layar. */

const NAV = [
  ["cara", "Cara kerja"],
  ["coba", "Baca emosi"],
  ["fitur", "Fitur"],
  ["privasi", "Privasi"],
  ["faq", "FAQ"],
] as const;

const MOODS = ["senang", "percaya", "sedih", "marah", "takut", "jijik", "terkejut", "waspada"];

/** Harga sesi termurah dari API (publik); null bila API tidak terjangkau. */
async function consultSummary(): Promise<{ count: number; minPrice: number | null } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/public/consult`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch {
    return null;
  }
}

const FEATS = [
  ["Jurnal", "Setiap curhat menjadi titik berwarna. Dalam seminggu kamu bisa melihat emosi yang paling sering datang, dan kapan.", "Pengingat harian jam 07.00"],
  ["Forum", "Bercerita dan saling menguatkan dengan nama samaran acak. Tanpa foto, tanpa nama asli.", "Nama samaran otomatis"],
  ["Psikolog", "Sesi chat 50 menit dengan psikolog berlisensi. Bayar per sesi, diverifikasi dalam 1×24 jam.", "Bayar per sesi"],
  ["Artikel", "Bacaan singkat tentang kesehatan mental dengan bahasa sehari-hari.", "Beberapa menit baca"],
];

const PRIV: [IconName, string, string][] = [
  ["lock", "Jurnal terkunci", "Curhat di jurnal hanya bisa dibaca olehmu, kecuali kamu sendiri yang membagikannya."],
  ["spark", "Dibaca di perangkat", "Pembaca emosi berjalan di browser-mu. Teks curhat tidak dikirim ke server untuk dianalisis."],
  ["eye", "Nama samaran", "Di forum kamu tampil dengan nama samaran acak. Email dan nama aslimu tidak pernah ditampilkan."],
];

const FAQ = [
  ["Apakah CurhatKu gratis?", "Ya. Menulis curhat, jurnal, forum, dan artikel gratis. Yang berbayar hanya sesi dengan psikolog."],
  ["Apakah curhatku bisa dibaca orang lain?", "Tidak. Curhat di jurnal hanya bisa dibaca olehmu. Yang tampil di forum hanya diskusi yang kamu kirim sendiri, dengan nama samaran."],
  ["Seberapa akurat pembacaan emosinya?", "Hasilnya perkiraan, bukan diagnosis. Karena itu kamu selalu bisa mengubah curhat sebelum menyimpannya."],
  ["Berapa biaya konsultasi?", "Tergantung psikolog, dibayar per sesi 50 menit tanpa langganan. Pembayaran lewat transfer bank, lalu unggah bukti di aplikasi. Admin memverifikasi maksimal 1×24 jam, setelah itu chat sesi terbuka."],
  ["Apakah CurhatKu pengganti layanan darurat?", "Bukan. Jika kamu atau orang di sekitarmu dalam bahaya, segera hubungi 119 ext. 8."],
];

const Wrap = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`mx-auto w-full max-w-land px-5 md:px-10 ${className}`}>{children}</div>
);

const Kicker = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <p className={`mb-4 text-[13px] font-semibold text-invert ${className}`}>{children}</p>
);

const H2 = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <h2 className={`max-w-[17ch] text-[clamp(34px,4.6vw,60px)] font-semibold leading-[1.03] tracking-[-0.047em] ${className}`}>{children}</h2>
);

const SCREEN = "flex min-h-svh flex-col justify-center border-t border-line py-20 md:py-24";

export default async function Landing() {
  const consult = await consultSummary();
  const feats = FEATS.map((f) =>
    f[0] === "Psikolog" && consult?.minPrice ? ([f[0], f[1], `Mulai ${rupiah(consult.minPrice)} / sesi`] as const) : f
  );
  return (
    <>
      <header className="sticky top-0 z-30 bg-bg/85 backdrop-blur-xl">
        <Wrap className="flex h-[68px] items-center gap-8">
          <Link href="/" aria-label="CurhatKu">
            <Wordmark />
          </Link>
          <nav aria-label="Bagian" className="ml-auto hidden gap-6 text-[13.5px] font-medium text-ink-muted md:flex">
            {NAV.map(([id, l]) => (
              <a key={id} href={`#${id}`} className="hover:text-ink">
                {l}
              </a>
            ))}
          </nav>
          <Link href="/masuk" className="ml-auto border-b-[1.5px] border-ink py-2 text-[14px] font-semibold md:ml-0">
            Masuk
          </Link>
        </Wrap>
      </header>

      <main id="konten" className="scroll-smooth">
        {/* Pembuka */}
        <section className="flex min-h-[calc(100svh-68px)] flex-col justify-center py-12">
          <Wrap className="grid items-center gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-[72px]">
            <div>
              <h1 className="text-[clamp(52px,7.4vw,104px)] font-semibold leading-[0.95] tracking-[-0.055em]">
                Ceritamu,
                <br />
                dalam warna.
              </h1>
              <p className="mt-6 max-w-[46ch] text-[clamp(16px,1.35vw,19px)] text-ink-muted">
                Setiap curhat yang kamu tulis menjadi satu aliran warna. Lama-lama kamu bisa melihat perasaan apa yang paling sering datang, dan kapan.
              </p>
            </div>
            <figure className="m-0 min-w-0">
              <River />
            </figure>
          </Wrap>
        </section>

        {/* Hari ini rasanya */}
        <section className={SCREEN}>
          <Wrap>
            <Kicker className="text-center">Hari ini rasanya…</Kicker>
            <FeelCycle />
          </Wrap>
        </section>

        {/* Satu hari bersama CurhatKu */}
        <section id="cara" className={SCREEN}>
          <Wrap>
            <div className="grid items-end gap-8 md:grid-cols-2">
              <div>
                <Kicker>Cara kerja</Kicker>
                <H2>Satu hari bersama CurhatKu.</H2>
              </div>
              <p className="max-w-[44ch] text-[clamp(15.5px,1.25vw,17.5px)] text-ink-muted">
                Tidak perlu waktu lama. Beberapa menit di sela harimu sudah cukup untuk mulai mengenali perasaan sendiri.
              </p>
            </div>
            <ol className="mt-14 border-b border-line">
              {[
                ["07.00", "Satu kata untuk pagi ini", "Pengingat lembut mengajakmu check-in. Pilih satu emosi, selesai.",
                  <span key="v" className="flex items-center gap-2.5 text-[13.5px] text-ink-soft"><LogoMark size={22} /><span><b className="font-semibold text-ink">Selamat pagi</b><br />Satu kata untuk hari ini?</span></span>],
                ["12.30", "Tulis yang mengganjal", "Ceritakan apa adanya. Emosinya terbaca otomatis saat kamu menulis.",
                  <span key="v" className="text-[17px] text-ink-soft">Besok sidang, <mark className="bg-[linear-gradient(transparent_55%,color-mix(in_srgb,var(--ck-mood-waspada)_70%,transparent)_55%)] px-0.5 text-inherit">dari semalam kepikiran terus</mark>.</span>],
                ["21.00", "Ada yang membalas", "Di forum, orang lain yang pernah merasakan hal sama ikut menguatkan, dengan nama samaran.",
                  <span key="v" className="flex items-center gap-2.5 text-[13.5px] text-ink-soft"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mood-percaya font-bold text-night">P</span><span><b className="font-semibold text-ink">Pohon Rindang</b> Coba napas kotak: tarik 4, tahan 4, buang 4.</span></span>],
                ["Minggu", "Lihat polanya", "Jurnal mingguan merangkum emosi yang paling sering datang. Kalau terasa berat, psikolog siap membantu.",
                  <span key="v" className="flex items-end gap-1.5">{[3, 5, 2, 6, 4, 8, 3].map((h, i) => <i key={i} className="w-[18px] rounded-t-[5px] rounded-b-[2px]" style={{ height: h * 6, background: `var(--ck-mood-${["takut", "percaya", "marah", "sedih", "senang", "waspada", "percaya"][i]})` }} />)}</span>],
              ].map(([time, title, body, vis]) => (
                <li key={time as string} className="grid items-center gap-3 border-t border-line py-8 md:grid-cols-[minmax(0,.7fr)_minmax(0,1.2fr)_minmax(0,1.1fr)] md:gap-8">
                  <time className="font-mono text-[clamp(32px,4vw,52px)] font-medium tracking-[-0.04em]">{time}</time>
                  <div>
                    <b className="block text-[20px] font-semibold tracking-[-0.025em]">{title}</b>
                    <p className="mt-1 max-w-[42ch] text-ink-muted">{body}</p>
                  </div>
                  <div className="flex min-h-14 items-end md:justify-end">{vis}</div>
                </li>
              ))}
            </ol>
          </Wrap>
        </section>

        {/* Demo baca emosi */}
        <section id="coba" className={`${SCREEN} bg-surface-strong`}>
          <Wrap>
            <EmotionDemo />
          </Wrap>
        </section>

        {/* Fitur */}
        <section id="fitur" className={SCREEN}>
          <Wrap>
            <Kicker>Fitur</Kicker>
            <H2>Satu tempat, empat cara merawat perasaan.</H2>
            <div className="mt-14 border-b border-line">
              {feats.map(([t, p, m], i) => (
                <div key={t} className="group grid items-baseline gap-x-4 gap-y-2 border-t border-line py-8 grid-cols-[40px_minmax(0,1fr)] md:grid-cols-[60px_minmax(0,.9fr)_minmax(0,1.6fr)_minmax(0,.8fr)] md:gap-6">
                  <span className="font-mono text-ink-muted">0{i + 1}</span>
                  <b className="text-[clamp(26px,3vw,38px)] font-semibold tracking-[-0.04em] transition-colors group-hover:text-invert">{t}</b>
                  <p className="col-start-2 max-w-[48ch] text-ink-muted md:col-start-auto">{p}</p>
                  <span className="col-start-2 text-[13px] font-medium text-ink-soft md:col-start-auto md:text-right">{m}</span>
                </div>
              ))}
            </div>
          </Wrap>
        </section>

        {/* Privasi */}
        <section id="privasi" className="flex min-h-svh flex-col justify-center bg-ink py-20 text-bg md:py-24">
          <Wrap>
            <Kicker className="!text-bg/65">Privasi</Kicker>
            <H2>Ceritamu tetap milikmu.</H2>
            <div className="mt-16 grid gap-8 md:grid-cols-3 md:gap-12">
              {PRIV.map(([ic, t, p]) => (
                <div key={t} className="flex flex-col gap-3 border-t border-bg/20 pt-6">
                  <Icon name={ic} className="h-6 w-6" />
                  <b className="text-[22px] font-semibold tracking-[-0.03em]">{t}</b>
                  <p className="text-bg/70">{p}</p>
                </div>
              ))}
            </div>
          </Wrap>
        </section>

        {/* FAQ */}
        <section id="faq" className={SCREEN}>
          <Wrap className="grid items-start gap-12 md:grid-cols-2 md:gap-[72px]">
            <div>
              <Kicker>FAQ</Kicker>
              <H2>Pertanyaan yang sering muncul</H2>
            </div>
            <div className="border-b border-line">
              {FAQ.map(([q, a], i) => (
                <details key={q} open={i === 0} className="group border-t border-line py-5">
                  <summary className="flex cursor-pointer list-none justify-between gap-4 text-[16px] font-semibold [&::-webkit-details-marker]:hidden">
                    {q}
                    <span aria-hidden="true" className="text-[20px] font-normal leading-none text-ink-muted group-open:hidden">+</span>
                    <span aria-hidden="true" className="hidden text-[20px] font-normal leading-none text-ink-muted group-open:inline">–</span>
                  </summary>
                  <p className="mt-2 max-w-[64ch] text-ink-muted">{a}</p>
                </details>
              ))}
            </div>
          </Wrap>
        </section>
      </main>

      <footer className="border-t border-line pt-[72px]">
        <Wrap>
          <div className="grid grid-cols-2 gap-10 md:grid-cols-[minmax(0,1.6fr)_minmax(0,.8fr)_minmax(0,.8fr)_minmax(0,1.1fr)]">
            <div className="col-span-2 md:col-span-1">
              <Wordmark size={36} />
              <p className="mt-3.5 max-w-[32ch] text-ink-muted">Ruang tenang untuk bercerita, mengenali emosi, dan menemukan bantuan.</p>
            </div>
            <nav aria-label="Produk" className="flex flex-col gap-2.5 text-[14px]">
              <b className="mb-1 text-[13px]">Produk</b>
              <a href="#cara" className="text-ink-muted hover:text-ink">Cara kerja</a>
              <a href="#coba" className="text-ink-muted hover:text-ink">Baca emosi</a>
              <a href="#fitur" className="text-ink-muted hover:text-ink">Fitur</a>
            </nav>
            <nav aria-label="Bantuan" className="flex flex-col gap-2.5 text-[14px]">
              <b className="mb-1 text-[13px]">Bantuan</b>
              <a href="#faq" className="text-ink-muted hover:text-ink">FAQ</a>
              <a href="#privasi" className="text-ink-muted hover:text-ink">Privasi</a>
              <Link href="/masuk" className="text-ink-muted hover:text-ink">Masuk</Link>
            </nav>
            <div className="col-span-2 flex flex-col gap-0.5 md:col-span-1">
              <b className="mb-1 text-[13px]">Butuh bantuan segera?</b>
              <p className="text-[14px] text-ink-muted">Layanan kesehatan jiwa</p>
              <span className="mt-1 font-mono text-[28px] tracking-[-0.02em]">119 ext. 8</span>
            </div>
          </div>
          <div aria-hidden="true" className="mt-16 flex h-1.5 gap-[3px] overflow-hidden rounded-full">
            {MOODS.map((m) => (
              <i key={m} className="flex-1" style={{ background: `var(--ck-mood-${m})` }} />
            ))}
          </div>
          <div className="flex flex-wrap justify-between gap-4 pb-8 pt-5 text-[13px] text-ink-muted">
            <span>© 2026 CurhatKu</span>
            <span>Dibuat untuk hari-hari yang berat dan yang biasa saja.</span>
          </div>
        </Wrap>
      </footer>
    </>
  );
}
