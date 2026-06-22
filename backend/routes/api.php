<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Job Portal
|--------------------------------------------------------------------------
|
| Auth:        /api/auth/*
| Jobs:        /api/jobs/*
| Profile:     /api/profile/*
| Candidate:   /api/candidate/*
| Employer:    /api/employer/*
| Admin:       /api/admin/*
|
*/

// ── Health Check ───────────────────────────────────────────────────────────────
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'timestamp' => now()]);
});

// ── Public Auth ────────────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// ── Public Jobs ────────────────────────────────────────────────────────────────
Route::prefix('jobs')->group(function () {
    Route::get('/',      [JobController::class, 'index']);
    Route::get('/{slug}',[JobController::class, 'show']);
});

// ── Authenticated Routes ───────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth endpoints
    Route::prefix('auth')->group(function () {
        Route::post('/logout',          [AuthController::class, 'logout']);
        Route::get('/me',               [AuthController::class, 'me']);
        Route::put('/change-password',  [AuthController::class, 'changePassword']);
    });

    // Profile (all authenticated users)
    Route::prefix('profile')->group(function () {
        Route::get('/',           [ProfileController::class, 'show']);
        Route::put('/',           [ProfileController::class, 'update']);
        Route::post('/avatar',    [ProfileController::class, 'uploadAvatar']);
        Route::put('/company',    [ProfileController::class, 'updateCompany']);
        Route::put('/candidate',  [ProfileController::class, 'updateCandidate']);
    });

    // ── Candidate routes ───────────────────────────────────────────────────────
    Route::prefix('candidate')->group(function () {
        Route::get('/applications',            [ApplicationController::class, 'myApplications']);
        Route::get('/saved-jobs',              [ApplicationController::class, 'savedJobs']);
        Route::post('/jobs/{jobId}/apply',     [ApplicationController::class, 'apply']);
        Route::post('/jobs/{jobId}/save',      [ApplicationController::class, 'saveJob']);
    });

    // ── Employer routes ────────────────────────────────────────────────────────
    Route::prefix('employer')->group(function () {
        Route::get('/jobs',                          [JobController::class, 'employerJobs']);
        Route::post('/jobs',                         [JobController::class, 'store']);
        Route::put('/jobs/{id}',                     [JobController::class, 'update']);
        Route::delete('/jobs/{id}',                  [JobController::class, 'destroy']);
        Route::get('/jobs/{id}/applications',        [JobController::class, 'jobApplications']);
        Route::patch('/applications/{id}/status',    [ApplicationController::class, 'updateStatus']);
    });

    // ── Admin routes ───────────────────────────────────────────────────────────
    Route::prefix('admin')->group(function () {
        Route::get('/stats',                     [AdminController::class, 'stats']);
        Route::get('/users',                     [AdminController::class, 'users']);
        Route::patch('/users/{id}/toggle-status',[AdminController::class, 'toggleUserStatus']);
        Route::get('/jobs',                      [AdminController::class, 'jobs']);
        Route::patch('/jobs/{id}/status',        [AdminController::class, 'updateJobStatus']);
        Route::delete('/jobs/{id}',              [AdminController::class, 'deleteJob']);
    });
});
