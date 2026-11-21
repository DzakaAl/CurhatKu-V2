<?php

namespace App\Commands;

use App\Libraries\Notify;
use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;

/**
 * `php spark mood:remind` — pengingat check-in mood harian (M7+).
 * Jadwalkan via cron shared hosting, mis. tiap hari 19:00:
 *   0 19 * * * cd /path/api && php spark mood:remind
 */
class MoodReminder extends BaseCommand
{
    protected $group       = 'CurhatKu';
    protected $name        = 'mood:remind';
    protected $description = 'Kirim pengingat ke user yang belum check-in mood hari ini.';

    public function run(array $params)
    {
        $db    = db_connect();
        $today = date('Y-m-d');
        $done  = array_column($db->table('moods')->select('user_id')->where('date', $today)->get()->getResultArray(), 'user_id');
        $sent  = array_column($db->table('notifications')->select('user_id')->where('type', 'mood_reminder')
            ->where('created_at >=', $today . ' 00:00:00')->get()->getResultArray(), 'user_id');
        $skip  = array_map('intval', array_merge($done, $sent));

        $n = 0;
        foreach ($db->table('users')->select('id')->where('role', 'user')->get()->getResultArray() as $u) {
            if (in_array((int) $u['id'], $skip, true)) {
                continue;
            }
            Notify::send((int) $u['id'], 'mood_reminder', 'Bagaimana perasaanmu hari ini?', 'Luangkan 10 detik untuk check-in mood.', '/dashboard');
            $n++;
        }
        CLI::write("Pengingat terkirim: {$n}", 'green');
    }
}
