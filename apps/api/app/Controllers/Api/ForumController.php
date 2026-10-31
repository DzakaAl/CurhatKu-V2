<?php

namespace App\Controllers\Api;

use App\Libraries\Notify;
use CodeIgniter\HTTP\ResponseInterface;

/** M4 Forum anonim: penulis hanya tampil sebagai anon_handle. */
class ForumController extends ApiController
{
    public function categories()
    {
        return $this->ok($this->db()->table('forum_categories')->orderBy('id')->get()->getResultArray());
    }

    private function threadQuery()
    {
        return $this->db()->table('threads t')
            ->select('t.*, u.anon_handle AS author, c.slug AS category_slug, c.name AS category_name')
            ->join('users u', 'u.id = t.user_id')
            ->join('forum_categories c', 'c.id = t.category_id');
    }

    private function threadOut(array $t, array $liked): array
    {
        return [
            'id'           => (int) $t['id'],
            'title'        => $t['title'],
            'body'         => $t['body'],
            'author'       => $t['author'],
            'category'     => ['slug' => $t['category_slug'], 'name' => $t['category_name']],
            'likesCount'   => (int) $t['likes_count'],
            'repliesCount' => (int) $t['replies_count'],
            'liked'        => in_array((int) $t['id'], $liked, true),
            'mine'         => (int) $t['user_id'] === $this->uid(),
            'createdAt'    => $t['created_at'],
        ];
    }

    private function likedIds(): array
    {
        return array_map('intval', array_column(
            $this->db()->table('thread_likes')->select('thread_id')->where('user_id', $this->uid())->get()->getResultArray(),
            'thread_id'
        ));
    }

    public function threads()
    {
        $q   = $this->threadQuery()->orderBy('t.created_at', 'DESC')->limit(50);
        $cat = $this->request->getGet('category');
        if ($cat) {
            $q->where('c.slug', $cat);
        }
        $liked = $this->likedIds();

        return $this->ok(array_map(fn ($t) => $this->threadOut($t, $liked), $q->get()->getResultArray()));
    }

    public function show(int $id)
    {
        $t = $this->threadQuery()->where('t.id', $id)->get()->getRowArray();
        if (! $t) {
            return $this->fail('Diskusi tidak ditemukan.', 404);
        }
        $replies = $this->db()->table('replies r')->select('r.id, r.body, r.created_at, r.user_id, u.anon_handle AS author')
            ->join('users u', 'u.id = r.user_id')->where('r.thread_id', $id)->orderBy('r.created_at')->get()->getResultArray();

        return $this->ok($this->threadOut($t, $this->likedIds()) + [
            'replies' => array_map(fn ($r) => [
                'id' => (int) $r['id'], 'body' => $r['body'], 'author' => $r['author'],
                'mine' => (int) $r['user_id'] === $this->uid(), 'createdAt' => $r['created_at'],
            ], $replies),
        ]);
    }

    public function create()
    {
        $data = $this->validated([
            'categoryId' => 'required|is_natural_no_zero|is_not_unique[forum_categories.id]',
            'title'      => 'required|min_length[5]|max_length[160]',
            'body'       => 'required|min_length[10]|max_length[5000]',
        ]);
        if ($data instanceof ResponseInterface) {
            return $data;
        }
        $this->db()->table('threads')->insert([
            'category_id' => (int) $data['categoryId'], 'user_id' => $this->uid(),
            'title' => trim($data['title']), 'body' => trim($data['body']),
            'created_at' => $this->now(), 'updated_at' => $this->now(),
        ]);

        return $this->show((int) $this->db()->insertID())->setStatusCode(201);
    }

    public function reply(int $id)
    {
        $thread = $this->db()->table('threads')->where('id', $id)->get()->getRowArray();
        if (! $thread) {
            return $this->fail('Diskusi tidak ditemukan.', 404);
        }
        $data = $this->validated(['body' => 'required|min_length[2]|max_length[3000]']);
        if ($data instanceof ResponseInterface) {
            return $data;
        }
        $this->db()->table('replies')->insert([
            'thread_id' => $id, 'user_id' => $this->uid(), 'body' => trim($data['body']),
            'created_at' => $this->now(), 'updated_at' => $this->now(),
        ]);
        $this->db()->table('threads')->where('id', $id)->set('replies_count', 'replies_count + 1', false)->update();
        if ((int) $thread['user_id'] !== $this->uid()) {
            Notify::send((int) $thread['user_id'], 'forum_reply', 'Ada balasan di diskusimu', $thread['title'], "/forum/{$id}");
        }

        return $this->show($id)->setStatusCode(201);
    }

    public function like(int $id)
    {
        if (! $this->db()->table('threads')->where('id', $id)->countAllResults()) {
            return $this->fail('Diskusi tidak ditemukan.', 404);
        }
        $where = ['thread_id' => $id, 'user_id' => $this->uid()];
        $has   = $this->db()->table('thread_likes')->where($where)->countAllResults() > 0;
        if ($has) {
            $this->db()->table('thread_likes')->where($where)->delete();
            $this->db()->table('threads')->where('id', $id)->set('likes_count', 'likes_count - 1', false)->update();
        } else {
            $this->db()->table('thread_likes')->insert($where + ['created_at' => $this->now()]);
            $this->db()->table('threads')->where('id', $id)->set('likes_count', 'likes_count + 1', false)->update();
        }
        $count = (int) $this->db()->table('threads')->select('likes_count')->where('id', $id)->get()->getRow()->likes_count;

        return $this->ok(['liked' => ! $has, 'likesCount' => $count]);
    }

    public function delete(int $id)
    {
        $t = $this->db()->table('threads')->where('id', $id)->get()->getRowArray();
        if (! $t || ((int) $t['user_id'] !== $this->uid() && \App\Libraries\Auth::user()['role'] !== 'admin')) {
            return $this->fail('Diskusi tidak ditemukan.', 404);
        }
        $this->db()->table('replies')->where('thread_id', $id)->delete();
        $this->db()->table('thread_likes')->where('thread_id', $id)->delete();
        $this->db()->table('threads')->where('id', $id)->delete();

        return $this->ok(true);
    }
}
