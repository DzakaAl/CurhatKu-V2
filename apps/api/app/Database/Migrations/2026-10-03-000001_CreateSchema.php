<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

/**
 * Skema MVP CurhatKu (M1–M7). Hanya tipe portabel agar jalan di MySQL & SQLite.
 */
class CreateSchema extends Migration
{
    private function id(): array
    {
        return ['id' => ['type' => 'INTEGER', 'unsigned' => true, 'auto_increment' => true]];
    }

    private function fk(bool $null = false): array
    {
        return ['type' => 'INTEGER', 'unsigned' => true, 'null' => $null];
    }

    private function ts(): array
    {
        return [
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ];
    }

    private function make(string $table, array $fields, array $keys = [], array $unique = []): void
    {
        $this->forge->addField($fields);
        $this->forge->addPrimaryKey(array_key_first($fields) === 'id' ? 'id' : array_keys($fields)[0]);
        foreach ($keys as $k) {
            $this->forge->addKey($k);
        }
        foreach ($unique as $u) {
            $this->forge->addUniqueKey($u);
        }
        $this->forge->createTable($table, true);
    }

    public function up()
    {
        $this->make('users', $this->id() + [
            'email'             => ['type' => 'VARCHAR', 'constraint' => 191],
            'password_hash'     => ['type' => 'VARCHAR', 'constraint' => 255],
            'name'              => ['type' => 'VARCHAR', 'constraint' => 100],
            'bio'               => ['type' => 'TEXT', 'null' => true],
            'avatar_url'        => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => true],
            'role'              => ['type' => 'VARCHAR', 'constraint' => 20, 'default' => 'user'],
            'anon_handle'       => ['type' => 'VARCHAR', 'constraint' => 50],
            'email_verified_at' => ['type' => 'DATETIME', 'null' => true],
            'verify_token'      => ['type' => 'VARCHAR', 'constraint' => 64, 'null' => true],
            'reset_token'       => ['type' => 'VARCHAR', 'constraint' => 64, 'null' => true],
            'reset_expires'     => ['type' => 'DATETIME', 'null' => true],
        ] + $this->ts(), [], ['email', 'anon_handle']);

        $this->make('refresh_tokens', $this->id() + [
            'user_id'    => $this->fk(),
            'token_hash' => ['type' => 'VARCHAR', 'constraint' => 64],
            'expires_at' => ['type' => 'DATETIME'],
            'revoked_at' => ['type' => 'DATETIME', 'null' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
        ], ['user_id'], ['token_hash']);

        $this->make('moods', $this->id() + [
            'user_id'    => $this->fk(),
            'emotion'    => ['type' => 'VARCHAR', 'constraint' => 20],
            'note'       => ['type' => 'VARCHAR', 'constraint' => 280, 'null' => true],
            'date'       => ['type' => 'DATE'],
        ] + $this->ts(), [], [['user_id', 'date']]);

        $this->make('journals', $this->id() + [
            'user_id'     => $this->fk(),
            'content'     => ['type' => 'TEXT'],
            'emotion'     => ['type' => 'VARCHAR', 'constraint' => 20, 'null' => true],
            'confidence'  => ['type' => 'FLOAT', 'null' => true],
            'emotion2'    => ['type' => 'VARCHAR', 'constraint' => 20, 'null' => true],
            'confidence2' => ['type' => 'FLOAT', 'null' => true],
        ] + $this->ts(), ['user_id']);

        $this->make('forum_categories', $this->id() + [
            'slug' => ['type' => 'VARCHAR', 'constraint' => 50],
            'name' => ['type' => 'VARCHAR', 'constraint' => 80],
        ], [], ['slug']);

        $this->make('threads', $this->id() + [
            'category_id'   => $this->fk(),
            'user_id'       => $this->fk(),
            'title'         => ['type' => 'VARCHAR', 'constraint' => 160],
            'body'          => ['type' => 'TEXT'],
            'likes_count'   => ['type' => 'INTEGER', 'default' => 0],
            'replies_count' => ['type' => 'INTEGER', 'default' => 0],
        ] + $this->ts(), ['category_id', 'user_id']);

        $this->make('replies', $this->id() + [
            'thread_id' => $this->fk(),
            'user_id'   => $this->fk(),
            'body'      => ['type' => 'TEXT'],
        ] + $this->ts(), ['thread_id']);

        $this->make('thread_likes', $this->id() + [
            'thread_id'  => $this->fk(),
            'user_id'    => $this->fk(),
            'created_at' => ['type' => 'DATETIME', 'null' => true],
        ], [], [['thread_id', 'user_id']]);

        $this->make('articles', $this->id() + [
            'slug'         => ['type' => 'VARCHAR', 'constraint' => 160],
            'title'        => ['type' => 'VARCHAR', 'constraint' => 200],
            'excerpt'      => ['type' => 'VARCHAR', 'constraint' => 300],
            'body'         => ['type' => 'TEXT'],
            'read_minutes' => ['type' => 'INTEGER', 'default' => 3],
            'published_at' => ['type' => 'DATETIME', 'null' => true],
        ] + $this->ts(), [], ['slug']);

        $this->make('article_reads', $this->id() + [
            'article_id' => $this->fk(),
            'user_id'    => $this->fk(),
            'read_at'    => ['type' => 'DATETIME', 'null' => true],
        ], [], [['article_id', 'user_id']]);

        $this->make('psychologists', $this->id() + [
            'user_id'     => $this->fk(true),
            'name'        => ['type' => 'VARCHAR', 'constraint' => 100],
            'title'       => ['type' => 'VARCHAR', 'constraint' => 100],
            'bio'         => ['type' => 'TEXT'],
            'specialties' => ['type' => 'VARCHAR', 'constraint' => 255],
            'price'       => ['type' => 'INTEGER'],
        ] + $this->ts());

        $this->make('slots', $this->id() + [
            'psychologist_id' => $this->fk(),
            'starts_at'       => ['type' => 'DATETIME'],
            'is_booked'       => ['type' => 'INTEGER', 'default' => 0],
        ], ['psychologist_id']);

        $this->make('bookings', $this->id() + [
            'user_id'         => $this->fk(),
            'psychologist_id' => $this->fk(),
            'slot_id'         => $this->fk(),
            'status'          => ['type' => 'VARCHAR', 'constraint' => 30, 'default' => 'pending_payment'],
            'amount'          => ['type' => 'INTEGER'],
            'proof_path'      => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => true],
            'admin_note'      => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => true],
        ] + $this->ts(), ['user_id', 'psychologist_id'], ['slot_id']);

        $this->make('messages', $this->id() + [
            'booking_id' => $this->fk(),
            'sender_id'  => $this->fk(),
            'body'       => ['type' => 'TEXT'],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
        ], ['booking_id']);

        $this->make('notifications', $this->id() + [
            'user_id'    => $this->fk(),
            'type'       => ['type' => 'VARCHAR', 'constraint' => 30],
            'title'      => ['type' => 'VARCHAR', 'constraint' => 160],
            'body'       => ['type' => 'VARCHAR', 'constraint' => 300, 'null' => true],
            'link'       => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => true],
            'read_at'    => ['type' => 'DATETIME', 'null' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
        ], ['user_id']);
    }

    public function down()
    {
        foreach ([
            'notifications', 'messages', 'bookings', 'slots', 'psychologists', 'article_reads',
            'articles', 'thread_likes', 'replies', 'threads', 'forum_categories', 'journals',
            'moods', 'refresh_tokens', 'users',
        ] as $t) {
            $this->forge->dropTable($t, true);
        }
    }
}
