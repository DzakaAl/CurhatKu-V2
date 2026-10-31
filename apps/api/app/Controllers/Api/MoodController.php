<?php

namespace App\Controllers\Api;

use CodeIgniter\HTTP\ResponseInterface;

/** M2 + M3: check-in mood, journal CRUD, ringkasan dashboard. */
class MoodController extends ApiController
{
    private const EMOTIONS = 'Waspada,Marah,Jijik,Takut,Senang,Sedih,Terkejut,Percaya';

    private function journalOut(array $j): array
    {
        return [
            'id'          => (int) $j['id'],
            'content'     => $j['content'],
            'emotion'     => $j['emotion'],
            'confidence'  => $j['confidence'] !== null ? (float) $j['confidence'] : null,
            'emotion2'    => $j['emotion2'],
            'confidence2' => $j['confidence2'] !== null ? (float) $j['confidence2'] : null,
            'createdAt'   => $j['created_at'],
            'updatedAt'   => $j['updated_at'],
        ];
    }

    public function checkin()
    {
        $data = $this->validated([
            'emotion' => 'required|in_list[' . self::EMOTIONS . ']',
            'note'    => 'permit_empty|max_length[280]',
        ]);
        if ($data instanceof ResponseInterface) {
            return $data;
        }
        $t     = $this->db()->table('moods');
        $today = date('Y-m-d');
        $row   = ['emotion' => $data['emotion'], 'note' => $data['note'] ?? null, 'updated_at' => $this->now()];
        if ($t->where(['user_id' => $this->uid(), 'date' => $today])->countAllResults() > 0) {
            $this->db()->table('moods')->where(['user_id' => $this->uid(), 'date' => $today])->update($row);
        } else {
            $this->db()->table('moods')->insert($row + ['user_id' => $this->uid(), 'date' => $today, 'created_at' => $this->now()]);
        }

        return $this->ok(['date' => $today, 'emotion' => $data['emotion']]);
    }

    public function summary()
    {
        $uid  = $this->uid();
        $from = date('Y-m-d', strtotime('-29 days'));
        $moods = $this->db()->table('moods')->where('user_id', $uid)->where('date >=', $from)
            ->orderBy('date', 'DESC')->get()->getResultArray();
        $journals = $this->db()->table('journals')->select('emotion, created_at')->where('user_id', $uid)
            ->where('created_at >=', $from . ' 00:00:00')->orderBy('created_at', 'DESC')->get()->getResultArray();

        // Emosi per hari: check-in mood menang, lalu journal terbaru.
        $byDay = [];
        foreach ($journals as $j) {
            $d = substr($j['created_at'], 0, 10);
            if (! isset($byDay[$d]) && $j['emotion']) {
                $byDay[$d] = $j['emotion'];
            }
        }
        $active = array_fill_keys(array_map(static fn ($j) => substr($j['created_at'], 0, 10), $journals), true);
        foreach ($moods as $m) {
            $byDay[$m['date']] = $m['emotion'];
            $active[$m['date']] = true;
        }

        $week = [];
        for ($i = 6; $i >= 0; $i--) {
            $d      = date('Y-m-d', strtotime("-{$i} days"));
            $week[] = ['date' => $d, 'emotion' => $byDay[$d] ?? null];
        }

        // Streak: hari berturut-turut aktif, boleh mulai kemarin bila hari ini belum.
        $streak = 0;
        $cursor = isset($active[date('Y-m-d')]) ? 0 : 1;
        while (isset($active[date('Y-m-d', strtotime("-{$cursor} days"))])) {
            $streak++;
            $cursor++;
        }

        $today = $moods && $moods[0]['date'] === date('Y-m-d') ? $moods[0]['emotion'] : null;

        return $this->ok([
            'streak'       => $streak,
            'todayMood'    => $today,
            'week'         => $week,
            'journalCount' => $this->db()->table('journals')->where('user_id', $uid)->countAllResults(),
        ]);
    }

    public function journals()
    {
        $rows = $this->db()->table('journals')->where('user_id', $this->uid())
            ->orderBy('created_at', 'DESC')->limit(100)->get()->getResultArray();

        return $this->ok(array_map([$this, 'journalOut'], $rows));
    }

    private function journalRules(): array
    {
        return [
            'content'     => 'required|max_length[10000]',
            'emotion'     => 'permit_empty|in_list[' . self::EMOTIONS . ']',
            'confidence'  => 'permit_empty|decimal',
            'emotion2'    => 'permit_empty|in_list[' . self::EMOTIONS . ']',
            'confidence2' => 'permit_empty|decimal',
        ];
    }

    private function journalRow(array $d): array
    {
        return [
            'content'     => trim($d['content']),
            'emotion'     => ($d['emotion'] ?? null) ?: null,
            'confidence'  => isset($d['confidence']) ? (float) $d['confidence'] : null,
            'emotion2'    => ($d['emotion2'] ?? null) ?: null,
            'confidence2' => isset($d['confidence2']) ? (float) $d['confidence2'] : null,
            'updated_at'  => $this->now(),
        ];
    }

    private function findJournal(int $id): ?array
    {
        return $this->db()->table('journals')->where(['id' => $id, 'user_id' => $this->uid()])->get()->getRowArray();
    }

    public function createJournal()
    {
        $data = $this->validated($this->journalRules());
        if ($data instanceof ResponseInterface) {
            return $data;
        }
        $this->db()->table('journals')->insert($this->journalRow($data) + ['user_id' => $this->uid(), 'created_at' => $this->now()]);

        return $this->ok($this->journalOut($this->findJournal((int) $this->db()->insertID())), 201);
    }

    public function showJournal(int $id)
    {
        $j = $this->findJournal($id);

        return $j ? $this->ok($this->journalOut($j)) : $this->fail('Journal tidak ditemukan.', 404);
    }

    public function updateJournal(int $id)
    {
        if (! $this->findJournal($id)) {
            return $this->fail('Journal tidak ditemukan.', 404);
        }
        $data = $this->validated($this->journalRules());
        if ($data instanceof ResponseInterface) {
            return $data;
        }
        $this->db()->table('journals')->where('id', $id)->update($this->journalRow($data));

        return $this->ok($this->journalOut($this->findJournal($id)));
    }

    public function deleteJournal(int $id)
    {
        if (! $this->findJournal($id)) {
            return $this->fail('Journal tidak ditemukan.', 404);
        }
        $this->db()->table('journals')->where('id', $id)->delete();

        return $this->ok(true);
    }
}
