<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */
$routes->get('/', static fn () => service('response')->setJSON(['name' => 'CurhatKu API', 'ok' => true]));

// Preflight CORS untuk semua path API.
$routes->options('api/(:any)', static fn () => service('response')->setStatusCode(204));

$routes->group('api', ['namespace' => 'App\Controllers\Api'], static function (RouteCollection $r) {
    // M1 — publik
    $r->post('auth/register', 'AuthController::register');
    $r->post('auth/login', 'AuthController::login');
    $r->post('auth/refresh', 'AuthController::refresh');
    $r->post('auth/logout', 'AuthController::logout');
    $r->post('auth/verify', 'AuthController::verify');
    $r->post('auth/forgot', 'AuthController::forgot');
    $r->post('auth/reset', 'AuthController::reset');

    $r->group('', ['filter' => 'auth'], static function (RouteCollection $r) {
        $r->get('me', 'AuthController::me');
        $r->put('me', 'AuthController::updateProfile');

        // M2/M3
        $r->get('dashboard', 'MoodController::summary');
        $r->post('moods', 'MoodController::checkin');
        $r->get('journals', 'MoodController::journals');
        $r->post('journals', 'MoodController::createJournal');
        $r->get('journals/(:num)', 'MoodController::showJournal/$1');
        $r->put('journals/(:num)', 'MoodController::updateJournal/$1');
        $r->delete('journals/(:num)', 'MoodController::deleteJournal/$1');

        // M4
        $r->get('forum/categories', 'ForumController::categories');
        $r->get('forum/threads', 'ForumController::threads');
        $r->post('forum/threads', 'ForumController::create');
        $r->get('forum/threads/(:num)', 'ForumController::show/$1');
        $r->delete('forum/threads/(:num)', 'ForumController::delete/$1');
        $r->post('forum/threads/(:num)/replies', 'ForumController::reply/$1');
        $r->post('forum/threads/(:num)/like', 'ForumController::like/$1');

        // M5
        $r->get('articles', 'ArticleController::index');
        $r->get('articles/(:segment)', 'ArticleController::show/$1');
        $r->post('articles/(:num)/read', 'ArticleController::markRead/$1');

        // M6
        $r->get('psychologists', 'ConsultController::psychologists');
        $r->get('psychologists/(:num)', 'ConsultController::psychologist/$1');
        $r->get('bookings', 'ConsultController::myBookings');
        $r->post('bookings', 'ConsultController::book');
        $r->get('bookings/(:num)', 'ConsultController::show/$1');
        $r->post('bookings/(:num)/proof', 'ConsultController::uploadProof/$1');
        $r->get('bookings/(:num)/proof', 'ConsultController::proof/$1');
        $r->post('bookings/(:num)/cancel', 'ConsultController::cancel/$1');
        $r->get('bookings/(:num)/messages', 'ConsultController::messages/$1');
        $r->post('bookings/(:num)/messages', 'ConsultController::sendMessage/$1');

        // M7+
        $r->get('notifications', 'NotificationController::index');
        $r->post('notifications/read', 'NotificationController::readAll');

        // Admin
        $r->group('admin', ['filter' => 'admin'], static function (RouteCollection $r) {
            $r->get('bookings', 'ConsultController::adminBookings');
            $r->post('bookings/(:num)/verify', 'ConsultController::verify/$1');
            $r->post('articles', 'ArticleController::create');
        });
    });
});
