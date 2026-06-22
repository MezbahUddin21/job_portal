<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Job;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            abort_unless($request->user()?->isAdmin(), 403, 'Admin access required.');
            return $next($request);
        });
    }

    /**
     * GET /api/admin/stats
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'total_users'        => User::count(),
            'total_employers'    => User::where('role', 'employer')->count(),
            'total_candidates'   => User::where('role', 'candidate')->count(),
            'total_jobs'         => Job::count(),
            'published_jobs'     => Job::where('status', 'published')->count(),
            'total_applications' => Application::count(),
            'hired_count'        => Application::where('status', 'hired')->count(),
        ]);
    }

    /**
     * GET /api/admin/users
     */
    public function users(Request $request): JsonResponse
    {
        $users = User::query()
            ->when($request->role, fn ($q) => $q->where('role', $request->role))
            ->when($request->search, fn ($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate(20);

        return response()->json($users);
    }

    /**
     * PATCH /api/admin/users/{id}/toggle-status
     */
    public function toggleUserStatus(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->update(['is_active' => !$user->is_active]);
        return response()->json([
            'message' => $user->is_active ? 'User activated' : 'User deactivated',
            'user'    => $user,
        ]);
    }

    /**
     * GET /api/admin/jobs
     */
    public function jobs(Request $request): JsonResponse
    {
        $jobs = Job::with(['employer.companyProfile'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->withCount('applications')
            ->latest()
            ->paginate(20);

        return response()->json($jobs);
    }

    /**
     * PATCH /api/admin/jobs/{id}/status
     */
    public function updateJobStatus(Request $request, int $id): JsonResponse
    {
        $job = Job::findOrFail($id);
        $request->validate(['status' => ['required', 'in:draft,published,closed,paused']]);
        $job->update(['status' => $request->status]);
        return response()->json(['message' => 'Job status updated', 'job' => $job]);
    }

    /**
     * DELETE /api/admin/jobs/{id}
     */
    public function deleteJob(int $id): JsonResponse
    {
        Job::findOrFail($id)->delete();
        return response()->json(['message' => 'Job deleted']);
    }
}
