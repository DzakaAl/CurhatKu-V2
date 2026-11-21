<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/** M7+ Web Push: satu baris per perangkat/browser yang berlangganan. */
class CreatePushSubscriptions extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'         => ['type' => 'INTEGER', 'unsigned' => true, 'auto_increment' => true],
            'user_id'    => ['type' => 'INTEGER', 'unsigned' => true],
            'endpoint'   => ['type' => 'VARCHAR', 'constraint' => 500],
            'endpoint_hash' => ['type' => 'CHAR', 'constraint' => 64],
            'p256dh'     => ['type' => 'VARCHAR', 'constraint' => 255],
            'auth'       => ['type' => 'VARCHAR', 'constraint' => 100],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addKey('user_id');
        $this->forge->addUniqueKey('endpoint_hash');
        $this->forge->createTable('push_subscriptions', true);
    }

    public function down()
    {
        $this->forge->dropTable('push_subscriptions', true);
    }
}
