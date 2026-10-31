<?php

namespace App\Controllers\Api;

use App\Libraries\Auth;
use CodeIgniter\HTTP\ResponseInterface;

/** M1 Auth: register, login, refresh (rotasi), logout, verifikasi email, reset password. */
class AuthController extends ApiController
{
    private function setSession(array $user): ResponseInterface
    {
        $secure = filter_var(env('cookie.secure', false), FILTER_VALIDATE_BOOLEAN);
        $opts   = ['httponly' => true, 'samesite' => 'Lax', 'secure' => $secure, 'path' => '/'];
        $this->response->setCookie(array_merge($opts, [
            'name' => Auth::ACCESS_COOKIE, 'value' => Auth::issueAccess($user), 'expire' => Auth::accessTtl(),
        ]));
        $this->response->setCookie(array_merge($opts, [
            'name' => Auth::REFRESH_COOKIE, 'value' => Auth::issueRefresh((int) $user['id']), 'expire' => Auth::refreshTtl(),
        ]));

        return $this->ok(Auth::publicUser($user));
    }

    private function clearSession(): void
    {
        $this->response->deleteCookie(Auth::ACCESS_COOKIE, '', '/');
        $this->response->deleteCookie(Auth::REFRESH_COOKIE, '', '/');
    }

    /** Dev: tautan dicatat di log & dikembalikan agar alur bisa dites tanpa SMTP. */
    private function deliver(string $email, string $subject, string $url): ?string
    {
        log_message('info', "[mail] {$email} — {$subject}: {$url}");
        $mail = service('email');
        if (config('Email')->SMTPHost) {
            $mail->setTo($email)->setSubject($subject)->setMessage("Buka tautan ini: {$url}")->send();
        }

        return ENVIRONMENT === 'development' ? $url : null;
    }

    public function register()
    {
        $data = $this->validated([
            'name'     => 'required|min_length[2]|max_length[100]',
            'email'    => 'required|valid_email|max_length[191]|is_unique[users.email]',
            'password' => 'required|min_length[8]|max_length[72]',
        ]);
        if ($data instanceof ResponseInterface) {
            return $data;
        }
        $token = bin2hex(random_bytes(16));
        $this->db()->table('users')->insert([
            'email'         => strtolower(trim($data['email'])),
            'password_hash' => password_hash($data['password'], PASSWORD_DEFAULT),
            'name'          => trim($data['name']),
            'role'          => 'user',
            'anon_handle'   => Auth::randomHandle(),
            'verify_token'  => $token,
            'created_at'    => $this->now(),
            'updated_at'    => $this->now(),
        ]);
        $user = $this->db()->table('users')->where('id', $this->db()->insertID())->get()->getRowArray();
        $dev  = $this->deliver($user['email'], 'Verifikasi email CurhatKu', env('frontend.url') . "/verifikasi?token={$token}");
        $this->setSession($user);

        return $this->response->setStatusCode(201)
            ->setJSON(['data' => Auth::publicUser($user), 'devVerifyUrl' => $dev]);
    }

    public function login()
    {
        $data = $this->validated(['email' => 'required|valid_email', 'password' => 'required']);
        if ($data instanceof ResponseInterface) {
            return $data;
        }
        $user = $this->db()->table('users')->where('email', strtolower(trim($data['email'])))->get()->getRowArray();
        if (! $user || ! password_verify($data['password'], $user['password_hash'])) {
            return $this->fail('Email atau kata sandi salah.', 401);
        }

        return $this->setSession($user);
    }

    public function refresh()
    {
        $raw = $this->request->getCookie(Auth::REFRESH_COOKIE);
        $uid = $raw ? Auth::consumeRefresh($raw) : null;
        $user = $uid ? $this->db()->table('users')->where('id', $uid)->get()->getRowArray() : null;
        if (! $user) {
            $this->clearSession();

            return $this->fail('Sesi berakhir. Silakan masuk lagi.', 401);
        }

        return $this->setSession($user);
    }

    public function logout()
    {
        $raw = $this->request->getCookie(Auth::REFRESH_COOKIE);
        if ($raw) {
            Auth::revokeRefresh($raw);
        }
        $this->clearSession();

        return $this->ok(true);
    }

    public function me()
    {
        return $this->ok(Auth::publicUser(Auth::user()));
    }

    public function updateProfile()
    {
        $data = $this->validated([
            'name'      => 'required|min_length[2]|max_length[100]',
            'bio'       => 'permit_empty|max_length[500]',
            'avatarUrl' => 'permit_empty|valid_url_strict|max_length[255]',
        ]);
        if ($data instanceof ResponseInterface) {
            return $data;
        }
        $this->db()->table('users')->where('id', $this->uid())->update([
            'name'       => trim($data['name']),
            'bio'        => $data['bio'] ?? null,
            'avatar_url' => ($data['avatarUrl'] ?? '') ?: null,
            'updated_at' => $this->now(),
        ]);

        return $this->ok(Auth::publicUser($this->db()->table('users')->where('id', $this->uid())->get()->getRowArray()));
    }

    public function verify()
    {
        $token = (string) ($this->body()['token'] ?? '');
        $user  = $token ? $this->db()->table('users')->where('verify_token', $token)->get()->getRowArray() : null;
        if (! $user) {
            return $this->fail('Tautan verifikasi tidak valid atau sudah dipakai.', 400);
        }
        $this->db()->table('users')->where('id', $user['id'])
            ->update(['email_verified_at' => $this->now(), 'verify_token' => null]);

        return $this->ok(true);
    }

    public function forgot()
    {
        $email = strtolower(trim((string) ($this->body()['email'] ?? '')));
        $user  = $this->db()->table('users')->where('email', $email)->get()->getRowArray();
        $dev   = null;
        if ($user) {
            $token = bin2hex(random_bytes(16));
            $this->db()->table('users')->where('id', $user['id'])->update([
                'reset_token' => hash('sha256', $token), 'reset_expires' => date('Y-m-d H:i:s', time() + 3600),
            ]);
            $dev = $this->deliver($email, 'Atur ulang kata sandi', env('frontend.url') . "/reset?token={$token}");
        }

        // Respons sama untuk email terdaftar/tidak — cegah enumerasi akun.
        return $this->response->setJSON(['data' => true, 'devResetUrl' => $dev]);
    }

    public function reset()
    {
        $data = $this->validated(['token' => 'required', 'password' => 'required|min_length[8]|max_length[72]']);
        if ($data instanceof ResponseInterface) {
            return $data;
        }
        $user = $this->db()->table('users')->where('reset_token', hash('sha256', $data['token']))->get()->getRowArray();
        if (! $user || strtotime((string) $user['reset_expires']) < time()) {
            return $this->fail('Tautan reset tidak valid atau kedaluwarsa.', 400);
        }
        $this->db()->table('users')->where('id', $user['id'])->update([
            'password_hash' => password_hash($data['password'], PASSWORD_DEFAULT),
            'reset_token'   => null,
            'reset_expires' => null,
        ]);
        $this->db()->table('refresh_tokens')->where('user_id', $user['id'])->where('revoked_at', null)
            ->update(['revoked_at' => $this->now()]);

        return $this->ok(true);
    }
}
