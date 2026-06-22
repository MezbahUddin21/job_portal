<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Job;
use App\Models\SavedJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    /**
     * POST /api/candidate/jobs/{jobId}/apply
     */
    public function apply(Request $request, int $jobId): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->isCandidate(), 403, 'Only candidates can apply for jobs.');

        $job = Job::published()->findOrFail($jobId);

        if ($user->applications()->where('job_id', $jobId)->exists()) {
            return response()->json(['message' => 'You have already applied for this job.'], 422);
        }

        $data = $request->validate([
            'cover_letter' => ['nullable', 'string', 'max:5000'],
            'resume'       => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
        ]);

        $resumePath = null;
        if ($request->hasFile('resume')) {
            $resumePath = $request->file('resume')->store("resumes/{$user->id}", 'private');
        }

        $application = Application::create([
            'job_id'       => $job->id,
            'user_id'      => $user->id,
            'cover_letter' => $data['cover_letter'] ?? null,
            'resume'       => $resumePath,
        ]);

        return response()->json(['message' => 'Application submitted successfully', 'application' => $application], 201);
    }

    /**
     * GET /api/candidate/applications — Candidate's own applications
     */
    public function myApplications(Request $request): JsonResponse
    {
        $applications = $request->user()
            ->applications()
            ->with(['job.employer.companyProfile'])
            ->latest()
            ->paginate(15);

        return response()->json($applications);
    }

    /**
     * PATCH /api/employer/applications/{id}/status
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->isEmployer() || $user->isAdmin(), 403);

        $application = Application::whereHas('job', fn ($q) => $q->where('user_id', $user->id))
            ->findOrFail($id);

        $data = $request->validate([
            'status'         => ['required', 'in:pending,reviewing,shortlisted,rejected,hired'],
            'employer_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $application->update($data);

        return response()->json(['message' => 'Application status updated', 'application' => $application]);
    }

    /**
     * POST /api/candidate/jobs/{jobId}/save
     */
    public function saveJob(Request $request, int $jobId): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->isCandidate(), 403);

        $job = Job::published()->findOrFail($jobId);

        $existing = SavedJob::where('user_id', $user->id)->where('job_id', $jobId)->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['message' => 'Job removed from saved', 'saved' => false]);
        }

        SavedJob::create(['user_id' => $user->id, 'job_id' => $jobId]);
        return response()->json(['message' => 'Job saved', 'saved' => true]);
    }

    /**
     * GET /api/candidate/saved-jobs
     */
    public function savedJobs(Request $request): JsonResponse
    {
        $saved = $request->user()
            ->savedJobs()
            ->with(['job.employer.companyProfile'])
            ->latest()
            ->paginate(15);

        return response()->json($saved);
    }
}
