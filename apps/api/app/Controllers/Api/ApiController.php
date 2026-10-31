<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Libraries\Auth;
use CodeIgniter\HTTP\ResponseInterface;

/** Basis controller JSON: body parsing, validasi, respons error seragam. */
abstract class ApiController extends BaseController
{
    protected function body(): array
    {
        $json = $this->request->getJSON(true);

        return is_array($json) ? $json : ($this->request->getPost() ?? []);
    }

    protected function ok($data = null, int $status = 200): ResponseInterface
    {
        return $this->response->setStatusCode($status)->setJSON(['data' => $data]);
    }

    protected function fail(string $message, int $status = 400, ?array $fields = null): ResponseInterface
    {
        return $this->response->setStatusCode($status)
            ->setJSON(array_filter(['error' => 'request_failed', 'message' => $message, 'fields' => $fields]));
    }

    /** @return array|ResponseInterface data tervalidasi atau respons 422 */
    protected function validated(array $rules)
    {
        $data = $this->body();
        $v    = service('validation');
        $v->setRules($rules);
        if (! $v->run($data)) {
            return $this->fail('Periksa lagi isian yang ditandai.', 422, $v->getErrors());
        }

        return $data;
    }

    protected function uid(): int
    {
        return (int) Auth::id();
    }

    protected function now(): string
    {
        return date('Y-m-d H:i:s');
    }

    protected function db()
    {
        return db_connect();
    }
}
