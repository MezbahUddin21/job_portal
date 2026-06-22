<?php
// config/sanctum.php — key settings only (merge into full config)
// 'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,localhost:3000,localhost:5173')),
// 'expiration' => null,  // tokens don't expire (set to minutes e.g. 60*24*7 for 7 days)
// 'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),
// 'middleware' => [
//     'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
//     'encrypt_cookies' => Illuminate\Cookie\Middleware\EncryptCookies::class,
//     'validate_csrf_token' => Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
// ],

// config/cors.php — allow React dev server
return [
    'paths'                    => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods'          => ['*'],
    'allowed_origins'          => ['http://localhost:5173', 'http://localhost:3000'],
    'allowed_origins_patterns' => [],
    'allowed_headers'          => ['*'],
    'exposed_headers'          => [],
    'max_age'                  => 0,
    'supports_credentials'     => false,
];
