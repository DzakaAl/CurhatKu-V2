<?php

namespace App\Controllers\Api;

use App\Libraries\Auth;
use App\Libraries\Notify;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * M6 Konsultasi: psikolog → slot → booking → upload bukti transfer
 * → admin verifikasi → chat 1-on-1 (polling).
 */
class ConsultController extends ApiController
{
    public const STATUS_LABEL = [
        'pending_payment'       => 'Menunggu pembayaran',
        'awaiting_verification' => 'Bukti sedang diperiksa',
        'confirmed'             => 'Terkonfirmasi',
        'rejected'              => 'Pembayaran ditolak',
        'cancelled'             => 'Dibatalkan',
    ];

    private function psyOut(array $p): array
    {
        return [
            'id'          => (int) $p['id'],
            'name'        => $p['name'],
            'title'       => $p['title'],
            'bio'         => $p['bio'],
            'specialties' => array_map('trim', explode(',', $p['specialties'])),
            'price'       => (int) $p['price'],
        ];
    }

    public function psychologists()
    {
        return $this->ok(array_map([$this, 'psyOut'], $this->db()->table('psychologists')->orderBy('id')->get()->getResultArray()));
    }

    public function psychologist(int $id)
    {
        $p = $this->db()->table('psychologists')->where('id', $id)->get()->getRowArray();
        if (! $p) {
            return $this->fail('Psikolog tidak ditemukan.', 404);
        }
        $slots = $this->db()->table('slots')->where(['psychologist_id' => $id, 'is_booked' => 0])
            ->where('starts_at >', $this->now())->orderBy('starts_at')->limit(30)->get()->getResultArray();

        return $this->ok($this->psyOut($p) + [
            'slots' => array_map(static fn ($s) => ['id' => (int) $s['id'], 'startsAt' => $s['starts_at']], $slots),
        ]);
    }

    private function bookingQuery()
    {
        return $this->db()->table('bookings b')
            ->select('b.*, s.starts_at, p.name AS psy_name, p.title AS psy_title, p.user_id AS psy_user_id, u.anon_handle AS client')
            ->join('slots s', 's.id = b.slot_id')
            ->join('psychologists p', 'p.id = b.psychologist_id')
            ->join('users u', 'u.id = b.user_id');
    }

    private function bookingOut(array $b): array
    {
        return [
            'id'           => (int) $b['id'],
            'status'       => $b['status'],
            'statusLabel'  => self::STATUS_LABEL[$b['status']] ?? $b['status'],
            'amount'       => (int) $b['amount'],
            'startsAt'     => $b['starts_at'],
            'hasProof'     => $b['proof_path'] !== null,
            'adminNote'    => $b['admin_note'],
            'psychologist' => ['id' => (int) $b['psychologist_id'], 'name' => $b['psy_name'], 'title' => $b['psy_title']],
            'client'       => $b['client'],
            'createdAt'    => $b['created_at'],
        ];
    }

    /** Booking yang boleh diakses: milik klien, psikolognya, atau admin. */
    private function accessible(int $id): ?array
    {
        $b = $this->bookingQuery()->where('b.id', $id)->get()->getRowArray();
        if (! $b) {
            return null;
        }
        $u = Auth::user();
        $ok = (int) $b['user_id'] === (int) $u['id'] || (int) $b['psy_user_id'] === (int) $u['id'] || $u['role'] === 'admin';

        return $ok ? $b : null;
    }

    public function myBookings()
    {
        $u = Auth::user();
        $q = $this->bookingQuery()->orderBy('b.created_at', 'DESC');
        if ($u['role'] === 'psychologist') {
            $q->where('p.user_id', $u['id']);
        } else {
            $q->where('b.user_id', $u['id']);
        }

        return $this->ok(array_map([$this, 'bookingOut'], $q->get()->getResultArray()));
    }

    public function book()
    {
        $data = $this->validated(['slotId' => 'required|is_natural_no_zero']);
        if ($data instanceof ResponseInterface) {
            return $data;
        }
        $db   = $this->db();
        $slot = $db->table('slots')->where('id', (int) $data['slotId'])->get()->getRowArray();
        if (! $slot || strtotime($slot['starts_at']) < time()) {
            return $this->fail('Jadwal ini tidak tersedia.', 404);
        }
        $db->transStart();
        // Klaim slot secara atomik: hanya sukses bila masih kosong.
        $db->table('slots')->where(['id' => $slot['id'], 'is_booked' => 0])->update(['is_booked' => 1]);
        if ($db->affectedRows() !== 1) {
            $db->transComplete();

            return $this->fail('Jadwal ini baru saja dipesan orang lain. Pilih jadwal lain.', 409);
        }
        $price = (int) $db->table('psychologists')->select('price')->where('id', $slot['psychologist_id'])->get()->getRow()->price;
        $db->table('bookings')->insert([
            'user_id' => $this->uid(), 'psychologist_id' => $slot['psychologist_id'], 'slot_id' => $slot['id'],
            'status' => 'pending_payment', 'amount' => $price, 'created_at' => $this->now(), 'updated_at' => $this->now(),
        ]);
        $id = (int) $db->insertID();
        $db->transComplete();

        return $this->ok($this->bookingOut($this->accessible($id)), 201);
    }

    public function show(int $id)
    {
        $b = $this->accessible($id);

        return $b ? $this->ok($this->bookingOut($b)) : $this->fail('Booking tidak ditemukan.', 404);
    }

    public function uploadProof(int $id)
    {
        $b = $this->accessible($id);
        if (! $b || (int) $b['user_id'] !== $this->uid()) {
            return $this->fail('Booking tidak ditemukan.', 404);
        }
        if (! in_array($b['status'], ['pending_payment', 'rejected'], true)) {
            return $this->fail('Bukti tidak bisa diunggah pada status ini.', 409);
        }
        $file = $this->request->getFile('proof');
        if (! $file || ! $file->isValid()) {
            return $this->fail('Pilih foto bukti transfer.', 422, ['proof' => 'Wajib diisi.']);
        }
        if (! in_array($file->getMimeType(), ['image/jpeg', 'image/png', 'image/webp'], true) || $file->getSize() > 4 * 1024 * 1024) {
            return $this->fail('Bukti harus JPG, PNG, atau WEBP maksimal 4 MB.', 422, ['proof' => 'Format tidak didukung.']);
        }
        $name = $file->getRandomName();
        $file->move(WRITEPATH . 'uploads/proofs', $name);
        $this->db()->table('bookings')->where('id', $id)->update([
            'proof_path' => $name, 'status' => 'awaiting_verification', 'admin_note' => null, 'updated_at' => $this->now(),
        ]);
        foreach ($this->db()->table('users')->select('id')->where('role', 'admin')->get()->getResultArray() as $admin) {
            Notify::send((int) $admin['id'], 'payment', 'Bukti transfer baru', "Booking #{$id} menunggu verifikasi.", '/admin');
        }

        return $this->show($id);
    }

    public function proof(int $id)
    {
        $b = $this->accessible($id);
        if (! $b || ! $b['proof_path']) {
            return $this->fail('Bukti tidak ditemukan.', 404);
        }
        $path = WRITEPATH . 'uploads/proofs/' . basename($b['proof_path']);

        return $this->response->setHeader('Content-Type', mime_content_type($path) ?: 'application/octet-stream')
            ->setBody(file_get_contents($path));
    }

    public function cancel(int $id)
    {
        $b = $this->accessible($id);
        if (! $b || (int) $b['user_id'] !== $this->uid() || $b['status'] === 'confirmed') {
            return $this->fail('Booking tidak bisa dibatalkan.', 409);
        }
        $this->db()->table('bookings')->where('id', $id)->update(['status' => 'cancelled', 'updated_at' => $this->now()]);
        $this->db()->table('slots')->where('id', $b['slot_id'])->update(['is_booked' => 0]);

        return $this->show($id);
    }

    public function messages(int $id)
    {
        $b = $this->accessible($id);
        if (! $b) {
            return $this->fail('Booking tidak ditemukan.', 404);
        }
        $after = (int) ($this->request->getGet('after') ?? 0);
        $rows  = $this->db()->table('messages')->where('booking_id', $id)->where('id >', $after)
            ->orderBy('id')->limit(200)->get()->getResultArray();

        return $this->ok(array_map(fn ($m) => [
            'id' => (int) $m['id'], 'body' => $m['body'], 'mine' => (int) $m['sender_id'] === $this->uid(),
            'fromPsychologist' => (int) $m['sender_id'] === (int) $b['psy_user_id'], 'createdAt' => $m['created_at'],
        ], $rows));
    }

    public function sendMessage(int $id)
    {
        $b = $this->accessible($id);
        if (! $b) {
            return $this->fail('Booking tidak ditemukan.', 404);
        }
        if ($b['status'] !== 'confirmed') {
            return $this->fail('Chat terbuka setelah pembayaran dikonfirmasi.', 409);
        }
        $data = $this->validated(['body' => 'required|max_length[2000]']);
        if ($data instanceof ResponseInterface) {
            return $data;
        }
        $this->db()->table('messages')->insert([
            'booking_id' => $id, 'sender_id' => $this->uid(), 'body' => trim($data['body']), 'created_at' => $this->now(),
        ]);
        $to = $this->uid() === (int) $b['user_id'] ? (int) $b['psy_user_id'] : (int) $b['user_id'];
        if ($to) {
            Notify::send($to, 'chat', 'Pesan baru di sesi konsultasi', mb_strimwidth(trim($data['body']), 0, 80, '…'), "/konsultasi/booking/{$id}");
        }

        return $this->messages($id)->setStatusCode(201);
    }

    // ---- Admin ----

    public function adminBookings()
    {
        $status = $this->request->getGet('status') ?: 'awaiting_verification';
        $rows   = $this->bookingQuery()->where('b.status', $status)->orderBy('b.updated_at')->get()->getResultArray();

        return $this->ok(array_map([$this, 'bookingOut'], $rows));
    }

    public function verify(int $id)
    {
        $data = $this->validated(['approve' => 'required', 'note' => 'permit_empty|max_length[255]']);
        if ($data instanceof ResponseInterface) {
            return $data;
        }
        $b = $this->accessible($id);
        if (! $b || $b['status'] !== 'awaiting_verification') {
            return $this->fail('Booking tidak menunggu verifikasi.', 409);
        }
        $approve = filter_var($data['approve'], FILTER_VALIDATE_BOOLEAN);
        $this->db()->table('bookings')->where('id', $id)->update([
            'status' => $approve ? 'confirmed' : 'rejected', 'admin_note' => $data['note'] ?? null, 'updated_at' => $this->now(),
        ]);
        Notify::send(
            (int) $b['user_id'],
            'booking',
            $approve ? 'Sesi konsultasi terkonfirmasi' : 'Bukti pembayaran ditolak',
            $approve ? "Sesi dengan {$b['psy_name']} siap. Chat sudah terbuka." : ($data['note'] ?? 'Unggah ulang bukti yang jelas.'),
            "/konsultasi/booking/{$id}"
        );
        if ($approve && $b['psy_user_id']) {
            Notify::send((int) $b['psy_user_id'], 'booking', 'Sesi baru terkonfirmasi', "Klien {$b['client']}", "/konsultasi/booking/{$id}");
        }

        return $this->show($id);
    }
}
