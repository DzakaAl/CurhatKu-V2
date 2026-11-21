<?php

namespace App\Libraries;

use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;
use Throwable;

/**
 * Web Push (VAPID). Nonaktif otomatis bila kunci belum diisi di .env —
 * notifikasi in-app tetap jalan sebagai fallback.
 */
class Push
{
    public static function publicKey(): ?string
    {
        return env('vapid.publicKey') ?: null;
    }

    public static function enabled(): bool
    {
        return self::publicKey() !== null && (string) env('vapid.privateKey', '') !== '';
    }

    public static function send(int $userId, string $title, ?string $body, ?string $link): void
    {
        if (! self::enabled() || ENVIRONMENT === 'testing') {
            return;
        }
        $db   = db_connect();
        $subs = $db->table('push_subscriptions')->where('user_id', $userId)->get()->getResultArray();
        if (! $subs) {
            return;
        }

        try {
            $push = new WebPush(['VAPID' => [
                'subject'    => (string) env('vapid.subject', env('frontend.url', 'mailto:admin@localhost')),
                'publicKey'  => self::publicKey(),
                'privateKey' => (string) env('vapid.privateKey'),
            ]], ['TTL' => 86400], 5);
            $payload = json_encode(['title' => $title, 'body' => $body, 'link' => $link]);
            foreach ($subs as $s) {
                $push->queueNotification(Subscription::create([
                    'endpoint' => $s['endpoint'],
                    'keys'     => ['p256dh' => $s['p256dh'], 'auth' => $s['auth']],
                ]), $payload);
            }
            foreach ($push->flush() as $report) {
                // 404/410 = langganan kedaluwarsa → bersihkan.
                if ($report->isSubscriptionExpired()) {
                    $db->table('push_subscriptions')
                        ->where('endpoint_hash', hash('sha256', $report->getEndpoint()))->delete();
                }
            }
        } catch (Throwable $e) {
            log_message('error', '[push] ' . $e->getMessage());
        }
    }
}
