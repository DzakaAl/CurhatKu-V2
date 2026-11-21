<?php

namespace App\Controllers\Api;

use App\Libraries\Push;
use CodeIgniter\HTTP\ResponseInterface;

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

    /** Kunci publik VAPID untuk PushManager.subscribe(); null = push nonaktif. */
    public function pushKey()
    {
        return $this->ok(['enabled' => Push::enabled(), 'publicKey' => Push::publicKey()]);
    }

    public function subscribe()
    {
        $data = $this->validated([
            'endpoint'    => 'required|valid_url_strict[https]|max_length[500]',
            'keys.p256dh' => 'required|max_length[255]',
            'keys.auth'   => 'required|max_length[100]',
        ]);
        if ($data instanceof ResponseInterface) {
            return $data;
        }
        $hash = hash('sha256', $data['endpoint']);
        $t    = $this->db()->table('push_subscriptions');
        $t->where('endpoint_hash', $hash)->delete();
        $this->db()->table('push_subscriptions')->insert([
            'user_id' => $this->uid(), 'endpoint' => $data['endpoint'], 'endpoint_hash' => $hash,
            'p256dh' => $data['keys']['p256dh'], 'auth' => $data['keys']['auth'], 'created_at' => $this->now(),
        ]);

        return $this->ok(true, 201);
    }

    public function unsubscribe()
    {
        $endpoint = (string) ($this->body()['endpoint'] ?? '');
        $this->db()->table('push_subscriptions')
            ->where(['endpoint_hash' => hash('sha256', $endpoint), 'user_id' => $this->uid()])->delete();

        return $this->ok(true);
    }
}
