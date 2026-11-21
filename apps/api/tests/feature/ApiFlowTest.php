<?php

namespace Tests\Feature;

use App\Libraries\Auth;
use CodeIgniter\Test\CIUnitTestCase;
use CodeIgniter\Test\DatabaseTestTrait;
use CodeIgniter\Test\FeatureTestTrait;

/**
 * Alur end-to-end MVP: register → mood/journal → forum → artikel → konsultasi → notifikasi.
 *
 * @internal
 */
final class ApiFlowTest extends CIUnitTestCase
{
    use DatabaseTestTrait;
    use FeatureTestTrait;

    protected $migrate     = true;
    protected $migrateOnce = false;
    protected $refresh     = true;
    protected $namespace   = 'App';
    protected $seed        = \App\Database\Seeds\DatabaseSeeder::class;

    protected function tearDown(): void
    {
        $_COOKIE = [];
        service('superglobals')->setCookieArray([]);
        parent::tearDown();
    }

    private function actingAs(string $email): array
    {
        $u = db_connect()->table('users')->where('email', $email)->get()->getRowArray();
        $token = Auth::issueAccess($u);
        $_COOKIE[Auth::ACCESS_COOKIE] = $token;
        service('superglobals')->setCookie(Auth::ACCESS_COOKIE, $token);

        return $u;
    }

    private function json($res, int $status = 200): array
    {
        $res->assertStatus($status);

        return json_decode($res->getJSON(), true);
    }

    public function testUnauthenticatedIsRejected(): void
    {
        $this->get('api/me')->assertStatus(401);
    }

    public function testRegisterLoginAndProfile(): void
    {
        $this->withBodyFormat('json')
            ->post('api/auth/register', ['name' => 'Tes', 'email' => 'tes@x.id', 'password' => 'Rahasia123'])
            ->assertStatus(201);
        $this->withBodyFormat('json')
            ->post('api/auth/register', ['name' => 'Tes', 'email' => 'tes@x.id', 'password' => 'Rahasia123'])
            ->assertStatus(422);
        $this->withBodyFormat('json')
            ->post('api/auth/login', ['email' => 'tes@x.id', 'password' => 'salah-banget'])
            ->assertStatus(401);
        $this->withBodyFormat('json')
            ->post('api/auth/login', ['email' => 'tes@x.id', 'password' => 'Rahasia123'])
            ->assertOK();

        $this->actingAs('tes@x.id');
        $this->withBodyFormat('json')->put('api/me', ['name' => 'Nama Baru', 'bio' => 'halo'])
            ->assertJSONFragment(['data' => ['name' => 'Nama Baru']]);
    }

    public function testMoodJournalAndDashboard(): void
    {
        $this->withBodyFormat('json')
            ->post('api/auth/register', ['name' => 'Tes', 'email' => 'mood@x.id', 'password' => 'Rahasia123']);
        $this->actingAs('mood@x.id');

        $this->withBodyFormat('json')->post('api/moods', ['emotion' => 'Senang'])->assertOK();
        $this->withBodyFormat('json')->post('api/moods', ['emotion' => 'Bahagia'])->assertStatus(422);

        $res = $this->withBodyFormat('json')->post('api/journals', [
            'content' => 'hari ini senang sekali', 'emotion' => 'Senang', 'confidence' => 0.8,
        ]);
        $id = $this->json($res, 201)['data']['id'];

        $this->withBodyFormat('json')->put("api/journals/{$id}", ['content' => 'diubah'])->assertOK();
        $dash = $this->json($this->get('api/dashboard'))['data'];
        $this->assertSame(1, $dash['streak']);
        $this->assertSame('Senang', $dash['todayMood']);
        $this->assertSame(1, $dash['journalCount']);

        $this->delete("api/journals/{$id}")->assertOK();
        $this->get("api/journals/{$id}")->assertStatus(404);
    }

    public function testForumIsAnonymousAndNotifiesAuthor(): void
    {
        $this->withBodyFormat('json')
            ->post('api/auth/register', ['name' => 'Penulis Asli', 'email' => 'f1@x.id', 'password' => 'Rahasia123']);
        $this->actingAs('f1@x.id');
        $res = $this->withBodyFormat('json')->post('api/forum/threads', [
            'categoryId' => 1, 'title' => 'Judul diskusi', 'body' => 'Isi diskusi yang cukup panjang',
        ]);
        $thread = $this->json($res, 201)['data'];
        $this->assertStringNotContainsString('Penulis Asli', (string) $res->getJSON());

        $this->actingAs('admin@curhatku.test');
        $this->withBodyFormat('json')->post("api/forum/threads/{$thread['id']}/replies", ['body' => 'Semangat ya'])->assertStatus(201);
        $like = $this->json($this->post("api/forum/threads/{$thread['id']}/like"))['data'];
        $this->assertTrue($like['liked']);

        $this->actingAs('f1@x.id');
        $notifs = $this->json($this->get('api/notifications'))['data'];
        $this->assertNotEmpty($notifs);
    }

    public function testArticles(): void
    {
        $this->actingAs('admin@curhatku.test');
        $list = $this->json($this->get('api/articles'))['data'];
        $this->assertNotEmpty($list);
    }

    public function testConsultationBookingFlow(): void
    {
        $this->withBodyFormat('json')
            ->post('api/auth/register', ['name' => 'Klien', 'email' => 'k@x.id', 'password' => 'Rahasia123']);
        $this->actingAs('k@x.id');

        $psy  = $this->json($this->get('api/psychologists'))['data'][0];
        $slot = $this->json($this->get("api/psychologists/{$psy['id']}"))['data']['slots'][0];

        $b = $this->json($this->withBodyFormat('json')->post('api/bookings', ['slotId' => $slot['id']]), 201)['data'];
        $this->assertSame('pending_payment', $b['status']);
        $this->withBodyFormat('json')->post('api/bookings', ['slotId' => $slot['id']])->assertStatus(409);

        // Chat terkunci sebelum konfirmasi; non-admin tidak bisa memverifikasi.
        $this->withBodyFormat('json')->post("api/bookings/{$b['id']}/messages", ['body' => 'halo'])->assertStatus(409);
        $this->withBodyFormat('json')->post("api/admin/bookings/{$b['id']}/verify", ['approve' => true])->assertStatus(403);

        // Simulasikan bukti sudah diunggah (upload multipart diuji manual).
        db_connect()->table('bookings')->where('id', $b['id'])
            ->update(['status' => 'awaiting_verification', 'proof_path' => 'x.png']);

        $this->actingAs('admin@curhatku.test');
        $this->withBodyFormat('json')->post("api/admin/bookings/{$b['id']}/verify", ['approve' => true])
            ->assertJSONFragment(['data' => ['status' => 'confirmed']]);

        $this->actingAs('k@x.id');
        $this->withBodyFormat('json')->post("api/bookings/{$b['id']}/messages", ['body' => 'halo'])->assertStatus(201);

        $this->actingAs('psikolog@curhatku.test');
        $msgs = $this->json($this->get("api/bookings/{$b['id']}/messages"))['data'];
        $this->assertCount(1, $msgs);
        $this->assertFalse($msgs[0]['mine']);
    }

    public function testPushSubscription(): void
    {
        $this->actingAs('admin@curhatku.test');
        $this->json($this->get('api/push/key'));
        $sub = ['endpoint' => 'https://push.example.com/abc', 'keys' => ['p256dh' => 'k', 'auth' => 'a']];
        $this->json($this->withBodyFormat('json')->post('api/push/subscribe', $sub), 201);
        $this->json($this->withBodyFormat('json')->post('api/push/subscribe', $sub), 201);
        $this->seeNumRecords(1, 'push_subscriptions', []);
        $this->withBodyFormat('json')->post('api/push/subscribe', ['endpoint' => 'http://x'] + $sub)->assertStatus(422);
        $this->withBodyFormat('json')->post('api/push/unsubscribe', ['endpoint' => $sub['endpoint']])->assertOK();
        $this->seeNumRecords(0, 'push_subscriptions', []);
    }
}
