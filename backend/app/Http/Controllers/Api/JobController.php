<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class JobController extends Controller
{
    /**
     * GET /api/jobs — Public paginated list with filters
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search', 'category', 'type', 'location',
            'experience_level', 'is_remote', 'salary_min',
        ]);

        $jobs = Job::with(['employer.companyProfile'])
            ->published()
            ->filter($filters)
            ->latest()
            ->paginate($request->get('per_page', 15));

        return response()->json($jobs);
    }

    /**
     * GET /api/jobs/{slug} — Single job (public)
     */
    public function show(string $slug): JsonResponse
    {
        $job = Job::with(['employer.companyProfile'])
            ->where('slug', $slug)
            ->firstOrFail();

        // Increment view count
        $job->increment('views');

        return response()->json(['job' => $job]);
    }

    /**
     * POST /api/employer/jobs — Create a job (employer only)
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorizeEmployer($request);

        $data = $request->validate([
            'title'            => ['required', 'string', 'max:255'],
            'description'      => ['required', 'string'],
            'requirements'     => ['nullable', 'string'],
            'benefits'         => ['nullable', 'string'],
            'type'             => ['required', 'in:full-time,part-time,contract,freelance,internship'],
            'category'         => ['required', 'string'],
            'location'         => ['required', 'string'],
            'is_remote'        => ['boolean'],
            'salary_min'       => ['nullable', 'numeric', 'min:0'],
            'salary_max'       => ['nullable', 'numeric', 'gte:salary_min'],
            'currency'         => ['string', 'size:3'],
            'experience_level' => ['required', 'in:entry,junior,mid,senior,lead,executive'],
            'status'           => ['in:draft,published'],
            'expires_at'       => ['nullable', 'date', 'after:today'],
        ]);

        $job = $request->user()->jobs()->create($data);

        return response()->json(['message' => 'Job created', 'job' => $job], 201);
    }

    /**
     * PUT /api/employer/jobs/{id} — Update
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $this->authorizeEmployer($request);

        $job = $request->user()->jobs()->findOrFail($id);

        $data = $request->validate([
            'title'            => ['sometimes', 'string', 'max:255'],
            'description'      => ['sometimes', 'string'],
            'requirements'     => ['nullable', 'string'],
            'benefits'         => ['nullable', 'string'],
            'type'             => ['sometimes', 'in:full-time,part-time,contract,freelance,internship'],
            'category'         => ['sometimes', 'string'],
            'location'         => ['sometimes', 'string'],
            'is_remote'        => ['boolean'],
            'salary_min'       => ['nullable', 'numeric', 'min:0'],
            'salary_max'       => ['nullable', 'numeric'],
            'currency'         => ['string', 'size:3'],
            'experience_level' => ['sometimes', 'in:entry,junior,mid,senior,lead,executive'],
            'status'           => ['in:draft,published,paused,closed'],
            'expires_at'       => ['nullable', 'date'],
        ]);

        $job->update($data);

        return response()->json(['message' => 'Job updated', 'job' => $job]);
    }

    /**
     * DELETE /api/employer/jobs/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->authorizeEmployer($request);
        $request->user()->jobs()->findOrFail($id)->delete();
        return response()->json(['message' => 'Job deleted']);
    }

    /**
     * GET /api/employer/jobs — Employer's own jobs
     */
    public function employerJobs(Request $request): JsonResponse
    {
        $this->authorizeEmployer($request);

        $jobs = $request->user()
            ->jobs()
            ->withCount('applications')
            ->latest()
            ->paginate(15);

        return response()->json($jobs);
    }

    /**
     * GET /api/employer/jobs/{id}/applications
     */
    public function jobApplications(Request $request, int $id): JsonResponse
    {
        $this->authorizeEmployer($request);

        $job = $request->user()->jobs()->findOrFail($id);
        $applications = $job->applications()
            ->with(['candidate.candidateProfile'])
            ->latest()
            ->paginate(20);

        return response()->json($applications);
    }

    // ── Private ────────────────────────────────────────────────────────────────
    private function authorizeEmployer(Request $request): void
    {
        abort_unless(
            $request->user() && ($request->user()->isEmployer() || $request->user()->isAdmin()),
            403,
            'Only employers can manage jobs.'
        );
    }
}
