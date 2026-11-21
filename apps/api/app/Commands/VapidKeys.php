<?php

namespace App\Commands;

use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;
use Minishlink\WebPush\VAPID;

/** `php spark push:keys` — buat pasangan kunci VAPID untuk .env. */
class VapidKeys extends BaseCommand
{
    protected $group       = 'CurhatKu';
    protected $name        = 'push:keys';
    protected $description = 'Membuat pasangan kunci VAPID untuk Web Push.';

    public function run(array $params)
    {
        $k = VAPID::createVapidKeys();
        CLI::write("vapid.publicKey = '{$k['publicKey']}'");
        CLI::write("vapid.privateKey = '{$k['privateKey']}'");
        CLI::write('Salin ke .env. Frontend mengambil kunci publik dari /api/push/key.', 'yellow');
    }
}
