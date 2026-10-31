<?php

namespace App\Controllers\Api;

use CodeIgniter\HTTP\ResponseInterface;

/** M5 Artikel: list/detail publik, status baca per user, publish oleh admin. */
class ArticleController extends ApiController
{
    private function out(array $a, bool $withBody = false): array
    {
        $o = [
            'id'          => (int) $a['id'],
            'slug'        => $a['slug'],
            'title'       => $a['title'],
            'excerpt'     => $a['excerpt'],
            'readMinutes' => (int) $a['read_minutes'],
            'publishedAt' => $a['published_at'],
            'read'        => (bool) ($a['read_at'] ?? false),
        ];
        if ($withBody) {
            $o['body'] = $a['body'];
        }

        return $o;
    }

    private function query()
    {
        return $this->db()->table('articles a')->select('a.*, r.read_at')
            ->join('article_reads r', 'r.article_id = a.id AND r.user_id = ' . $this->uid(), 'left')
            ->where('a.published_at IS NOT NULL');
    }

    public function index()
    {
        $rows = $this->query()->orderBy('a.published_at', 'DESC')->get()->getResultArray();

        return $this->ok(array_map(fn ($a) => $this->out($a), $rows));
    }

    public function show(string $slug)
    {
        $a = $this->query()->where('a.slug', $slug)->get()->getRowArray();

        return $a ? $this->ok($this->out($a, true)) : $this->fail('Artikel tidak ditemukan.', 404);
    }

    public function markRead(int $id)
    {
        $where = ['article_id' => $id, 'user_id' => $this->uid()];
        if (! $this->db()->table('article_reads')->where($where)->countAllResults()) {
            $this->db()->table('article_reads')->insert($where + ['read_at' => $this->now()]);
        }

        return $this->ok(true);
    }

    public function create()
    {
        $data = $this->validated([
            'title'   => 'required|min_length[5]|max_length[200]',
            'excerpt' => 'required|max_length[300]',
            'body'    => 'required|min_length[50]',
        ]);
        if ($data instanceof ResponseInterface) {
            return $data;
        }
        helper('url');
        $slug = url_title(strtolower($data['title']), '-', true) . '-' . substr(bin2hex(random_bytes(3)), 0, 5);
        $words = str_word_count(strip_tags($data['body']));
        $this->db()->table('articles')->insert([
            'slug' => $slug, 'title' => trim($data['title']), 'excerpt' => trim($data['excerpt']),
            'body' => $data['body'], 'read_minutes' => max(1, (int) ceil($words / 200)),
            'published_at' => $this->now(), 'created_at' => $this->now(), 'updated_at' => $this->now(),
        ]);

        return $this->show($slug)->setStatusCode(201);
    }
}
