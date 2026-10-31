<?php

namespace App\Libraries;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Throwable;

/**
 * Token & konteks auth.
 * Access token = JWT HS256 pendek di cookie httpOnly `ck_at`.
 * Refresh token = string acak di cookie `ck_rt`, disimpan ter-hash, dirotasi tiap pakai.
 */
class Auth
{
    public const ACCESS_COOKIE  = 'ck_at';
    public const REFRESH_COOKIE = 'ck_rt';

    private static ?array $user = null;

    public static function setUser(?array $user): void
    {
        self::$user = $user;
    }

    public static function user(): ?array
    {
        return self::$user;
    }

    public static function id(): ?int
    {
        return self::$user ? (int) self::$user['id'] : null;
    }

    private static function secret(): string
    {
        return (string) env('jwt.secret', 'dev-only');
    }

    public static function accessTtl(): int
    {
        return (int) env('jwt.accessTtl', 900);
    }

    public static function refreshTtl(): int
    {
        return (int) env('jwt.refreshTtl', 2592000);
    }

    public static function issueAccess(array $user): string
    {
        $now = time();

        return JWT::encode([
            'sub'  => (int) $user['id'],
            'role' => $user['role'],
            'iat'  => $now,
            'exp'  => $now + self::accessTtl(),
        ], self::secret(), 'HS256');
    }

    /** @return array{sub:int, role:string}|null */
    public static function decodeAccess(string $jwt): ?array
    {
        try {
            $p = JWT::decode($jwt, new Key(self::secret(), 'HS256'));

            return ['sub' => (int) $p->sub, 'role' => (string) $p->role];
        } catch (Throwable) {
            return null;
        }
    }

    public static function issueRefresh(int $userId): string
    {
        $raw = bin2hex(random_bytes(32));
        db_connect()->table('refresh_tokens')->insert([
            'user_id'    => $userId,
            'token_hash' => hash('sha256', $raw),
            'expires_at' => date('Y-m-d H:i:s', time() + self::refreshTtl()),
            'created_at' => date('Y-m-d H:i:s'),
        ]);

        return $raw;
    }

    /** Validasi + cabut refresh token lama. Pemakaian ulang token yang sudah dicabut → cabut semua sesi user. */
    public static function consumeRefresh(string $raw): ?int
    {
        $db  = db_connect();
        $row = $db->table('refresh_tokens')->where('token_hash', hash('sha256', $raw))->get()->getRowArray();
        if (! $row) {
            return null;
        }
        if ($row['revoked_at'] !== null) {
            $db->table('refresh_tokens')->where('user_id', $row['user_id'])->where('revoked_at', null)
                ->update(['revoked_at' => date('Y-m-d H:i:s')]);

            return null;
        }
        $db->table('refresh_tokens')->where('id', $row['id'])->update(['revoked_at' => date('Y-m-d H:i:s')]);
        if (strtotime($row['expires_at']) < time()) {
            return null;
        }

        return (int) $row['user_id'];
    }

    public static function revokeRefresh(string $raw): void
    {
        db_connect()->table('refresh_tokens')->where('token_hash', hash('sha256', $raw))
            ->update(['revoked_at' => date('Y-m-d H:i:s')]);
    }

    public static function publicUser(array $u): array
    {
        return [
            'id'            => (int) $u['id'],
            'email'         => $u['email'],
            'name'          => $u['name'],
            'bio'           => $u['bio'],
            'avatarUrl'     => $u['avatar_url'],
            'role'          => $u['role'],
            'anonHandle'    => $u['anon_handle'],
            'emailVerified' => $u['email_verified_at'] !== null,
        ];
    }

    public static function randomHandle(): string
    {
        $a = ['Awan', 'Bintang', 'Embun', 'Ombak', 'Pelangi', 'Senja', 'Fajar', 'Angin', 'Hujan', 'Bulan'];
        $b = ['Tenang', 'Hangat', 'Lembut', 'Teduh', 'Riang', 'Sunyi', 'Jernih', 'Biru', 'Ceria', 'Damai'];

        return $a[array_rand($a)] . $b[array_rand($b)] . random_int(10, 999);
    }
}
