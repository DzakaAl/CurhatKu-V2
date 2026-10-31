<?php

namespace App\Controllers\Api;

/** M7+ Notifikasi in-app. */
class NotificationController extends ApiController
{
    public function index()
    {
        $rows = $this->db()->table('notifications')->where('user_id', $this->uid())
            ->orderBy('id', 'DESC')->limit(50)->get()->getResultArray();
        $unread = $this->db()->table('notifications')->where('user_id', $this->uid())->where('read_at', null)->countAllResults();

        return $this->response->setJSON([
            'data' => array_map(static fn ($n) => [
                'id' => (int) $n['id'], 'type' => $n['type'], 'title' => $n['title'], 'body' => $n['body'],
                'link' => $n['link'], 'read' => $n['read_at'] !== null, 'createdAt' => $n['created_at'],
            ], $rows),
            'unread' => $unread,
        ]);
    }

    public function readAll()
    {
        $this->db()->table('notifications')->where('user_id', $this->uid())->where('read_at', null)
            ->update(['read_at' => $this->now()]);

        return $this->ok(true);
    }
}
