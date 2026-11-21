import Link from "next/link";
import { PageHeader } from "@/components/ui/States";

const FLOWS: [string, string, [string, string][]][] = [
  ["Akun baru", "Daftar, masukkan kode dari email, lalu langsung ke beranda.", [["/daftar", "Daftar"], ["/verifikasi", "Verifikasi kode"], ["/dashboard", "Beranda"]]],
  ["Masuk & pemulihan", "Lupa kata sandi lewat tautan email.", [["/masuk", "Masuk"], ["/lupa", "Lupa kata sandi"], ["/masuk", "Masuk lagi"]]],
  ["Curhat harian", "Check-in mood, tulis, emosi terbaca otomatis, simpan ke jurnal.", [["/dashboard", "Beranda"], ["/dashboard#tulis", "Tulis curhat"], ["/journal", "Jurnal"]]],
  ["Forum", "Lihat linimasa, tulis diskusi, balas, peluk, simpan.", [["/forum", "Forum"], ["/forum", "Detail diskusi"]]],
  ["Artikel", "Baca lalu lanjut menulis.", [["/artikel", "Artikel"], ["/dashboard#tulis", "Tulis curhat"]]],
  ["Konsultasi", "Pilih psikolog dan jadwal, bayar, tunggu verifikasi, lalu chat.", [["/konsultasi", "Psikolog"], ["/konsultasi", "Pilih jadwal"], ["/konsultasi", "Bayar & unggah"], ["/konsultasi", "Chat sesi"]]],
  ["Akun", "Notifikasi, profil, pengingat, panel admin.", [["/notifikasi", "Notifikasi"], ["/profil", "Profil"], ["/admin", "Panel admin"]]],
];

/** Peta semua halaman dan alur aplikasi. */
export default function PetaPage() {
  return (
    <main className="flex flex-col gap-6">
      <PageHeader title="Peta layar" subtitle="Semua halaman dan alur di CurhatKu. Ketuk langkah mana pun untuk membukanya." />
      <div className="flex flex-col">
        {FLOWS.map(([t, d, steps]) => (
          <section key={t} className="flex flex-col gap-2.5 border-t border-line py-5">
            <div>
              <b className="font-semibold">{t}</b>
              <p className="text-[13px] text-ink-muted">{d}</p>
            </div>
            <nav aria-label={t} className="flex flex-wrap items-center gap-1.5">
              {steps.map(([href, l], i) => (
                <span key={l} className="flex items-center gap-1.5">
                  {i ? <span aria-hidden="true" className="text-[12px] text-ink-muted/60">→</span> : null}
                  <Link href={href} className="inline-flex min-h-8 items-center rounded-full border border-line-strong px-3 text-[12.5px] font-medium hover:border-invert hover:text-invert">
                    {l}
                  </Link>
                </span>
              ))}
            </nav>
          </section>
        ))}
      </div>
    </main>
  );
}
