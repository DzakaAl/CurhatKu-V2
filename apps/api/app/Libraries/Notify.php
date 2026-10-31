<?php

namespace App\Libraries;

/** Notifikasi in-app. (Web Push VAPID belum diaktifkan — butuh kunci & service worker.) */
class Notify
{
    public static function send(int $userId, string $type, string $title, ?string $body = null, ?string $link = null): void
    {
        db_connect()->table('notifications')->insert([
            'user_id'    => $userId,
            'type'       => $type,
            'title'      => $title,
            'body'       => $body,
            'link'       => $link,
            'created_at' => date('Y-m-d H:i:s'),
        ]);
    }
}
