<?php

namespace App\Database\Seeds;

use App\Libraries\Auth;
use CodeIgniter\Database\Seeder;

/**
 * Data awal: akun admin & psikolog demo, kategori forum, artikel, jadwal.
 * Password demo: "curhatku123" — GANTI sebelum produksi.
 */
class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $now = date('Y-m-d H:i:s');
        $pw  = password_hash('curhatku123', PASSWORD_DEFAULT);

        $user = function (string $email, string $name, string $role) use ($now, $pw): int {
            $row = $this->db->table('users')->where('email', $email)->get()->getRowArray();
            if ($row) {
                return (int) $row['id'];
            }
            $this->db->table('users')->insert([
                'email' => $email, 'password_hash' => $pw, 'name' => $name, 'role' => $role,
                'anon_handle' => Auth::randomHandle(), 'email_verified_at' => $now,
                'created_at' => $now, 'updated_at' => $now,
            ]);

            return (int) $this->db->insertID();
        };

        $user('admin@curhatku.test', 'Admin CurhatKu', 'admin');
        $psyUser = $user('psikolog@curhatku.test', 'Psikolog Demo', 'psychologist');

        if (! $this->db->table('forum_categories')->countAllResults()) {
            foreach ([
                ['cerita', 'Cerita harian'], ['kuliah-kerja', 'Kuliah & kerja'], ['keluarga', 'Keluarga'],
                ['hubungan', 'Hubungan'], ['dukungan', 'Butuh dukungan'],
            ] as [$slug, $name]) {
                $this->db->table('forum_categories')->insert(['slug' => $slug, 'name' => $name]);
            }
        }

        if (! $this->db->table('articles')->countAllResults()) {
            $articles = [
                ['Kenali emosimu dengan menamainya', 'Menyebut perasaan dengan tepat membantu otak menenangkannya.',
                    "Saat perasaan campur aduk, coba berhenti sejenak dan beri nama: sedih, kecewa, cemas, atau marah.\n\nPenelitian tentang affect labeling menunjukkan bahwa menamai emosi dapat menurunkan intensitasnya. Kamu tidak harus langsung menyelesaikan masalahnya — cukup akui dulu apa yang sedang kamu rasakan.\n\nMulailah dengan satu kalimat sederhana di journal: \"Hari ini aku merasa ... karena ...\". Lakukan setiap hari dan perhatikan polanya setelah seminggu."],
                ['Teknik napas 4-7-8 saat cemas', 'Cara cepat menenangkan tubuh ketika pikiran sedang berlari.',
                    "Tarik napas lewat hidung selama 4 hitungan. Tahan selama 7 hitungan. Hembuskan perlahan lewat mulut selama 8 hitungan.\n\nUlangi empat kali. Napas yang lebih panjang saat menghembuskan memberi sinyal pada sistem saraf bahwa kamu aman.\n\nTeknik ini bukan pengganti bantuan profesional. Jika cemas terasa terus-menerus dan mengganggu aktivitas, pertimbangkan untuk berbicara dengan psikolog."],
                ['Kapan sebaiknya mencari bantuan profesional?', 'Tanda-tanda bahwa bercerita saja mungkin belum cukup.',
                    "Curhat dan menulis journal sangat membantu, tetapi ada kalanya kamu butuh dukungan lebih.\n\nPertimbangkan bantuan profesional bila: perasaan sedih atau cemas berlangsung lebih dari dua minggu, tidur dan makan terganggu, sulit menjalani kuliah atau pekerjaan, atau muncul pikiran untuk menyakiti diri.\n\nJika kamu dalam bahaya, segera hubungi layanan darurat 112 atau orang terdekat. Mencari bantuan adalah tanda kekuatan, bukan kelemahan."],
            ];
            foreach ($articles as $i => [$title, $excerpt, $body]) {
                helper('url');
                $this->db->table('articles')->insert([
                    'slug' => url_title(strtolower($title), '-', true), 'title' => $title, 'excerpt' => $excerpt,
                    'body' => $body, 'read_minutes' => 2 + $i,
                    'published_at' => date('Y-m-d H:i:s', strtotime("-{$i} days")),
                    'created_at' => $now, 'updated_at' => $now,
                ]);
            }
        }

        if (! $this->db->table('psychologists')->countAllResults()) {
            $this->db->table('psychologists')->insertBatch([
                ['user_id' => $psyUser, 'name' => 'Psikolog Demo', 'title' => 'Psikolog Klinis (akun demo)',
                    'bio' => 'Akun demo untuk mencoba alur konsultasi. Ganti dengan data psikolog berlisensi sebelum rilis.',
                    'specialties' => 'Kecemasan, Stres kuliah, Hubungan', 'price' => 75000, 'created_at' => $now, 'updated_at' => $now],
                ['user_id' => null, 'name' => '[Nama psikolog]', 'title' => '[Gelar & nomor SIPP]',
                    'bio' => '[Profil singkat psikolog — isi dari data asli]',
                    'specialties' => 'Depresi, Keluarga', 'price' => 100000, 'created_at' => $now, 'updated_at' => $now],
            ]);
        }

        // Jadwal 7 hari ke depan, 3 sesi per hari per psikolog.
        foreach ($this->db->table('psychologists')->get()->getResultArray() as $p) {
            if ($this->db->table('slots')->where('psychologist_id', $p['id'])->where('starts_at >', $now)->countAllResults()) {
                continue;
            }
            for ($d = 1; $d <= 7; $d++) {
                foreach (['10:00', '14:00', '19:00'] as $h) {
                    $this->db->table('slots')->insert([
                        'psychologist_id' => $p['id'],
                        'starts_at' => date('Y-m-d', strtotime("+{$d} days")) . " {$h}:00",
                        'is_booked' => 0,
                    ]);
                }
            }
        }
    }
}
