<?php

namespace App\Filters;

use App\Libraries\Auth;
use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

/** Wajib access token valid di cookie httpOnly. 401 → FE memanggil /auth/refresh. */
class AuthFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        if (strtoupper($request->getMethod()) === 'OPTIONS') {
            return null;
        }
        $jwt     = $request->getCookie(Auth::ACCESS_COOKIE);
        $payload = $jwt ? Auth::decodeAccess($jwt) : null;
        $user    = $payload ? db_connect()->table('users')->where('id', $payload['sub'])->get()->getRowArray() : null;

        if (! $user) {
            return service('response')->setStatusCode(401)
                ->setJSON(['error' => 'unauthenticated', 'message' => 'Sesi berakhir. Silakan masuk lagi.']);
        }
        Auth::setUser($user);

        return null;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        return null;
    }
}
