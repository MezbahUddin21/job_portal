<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * GET /api/profile — Get authenticated user's profile
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load(['companyProfile', 'candidateProfile']);
        return response()->json(['user' => $user]);
    }

    /**
     * PUT /api/profile — Update base user info
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name'  => ['sometimes', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['sometimes', 'email', "unique:users,email,{$user->id}"],
        ]);

        $user->update($data);

        return response()->json(['message' => 'Profile updated', 'user' => $user]);
    }

    /**
     * PUT /api/profile/company — Employer company profile
     */
    public function updateCompany(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->isEmployer(), 403, 'Only employers can update company profile.');

        $data = $request->validate([
            'company_name' => ['sometimes', 'string', 'max:255'],
            'description'  => ['nullable', 'string'],
            'industry'     => ['sometimes', 'string'],
            'company_size' => ['nullable', 'string'],
            'website'      => ['nullable', 'url'],
            'location'     => ['sometimes', 'string'],
            'founded_year' => ['nullable', 'digits:4'],
        ]);

        $profile = $user->companyProfile()->firstOrCreate(['user_id' => $user->id]);
        $profile->update($data);

        return response()->json(['message' => 'Company profile updated', 'profile' => $profile]);
    }

    /**
     * PUT /api/profile/candidate — Candidate profile
     */
    public function updateCandidate(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->isCandidate(), 403, 'Only candidates can update candidate profile.');

        $data = $request->validate([
            'bio'              => ['nullable', 'string'],
            'headline'         => ['nullable', 'string', 'max:255'],
            'location'         => ['nullable', 'string'],
            'experience_years' => ['nullable', 'string'],
            'expected_salary'  => ['nullable', 'string'],
            'availability'     => ['nullable', 'in:immediately,two_weeks,one_month,not_looking'],
            'skills'           => ['nullable', 'array'],
            'skills.*'         => ['string', 'max:50'],
        ]);

        $profile = $user->candidateProfile()->firstOrCreate(['user_id' => $user->id]);
        $profile->update($data);

        return response()->json(['message' => 'Profile updated', 'profile' => $profile]);
    }

    /**
     * POST /api/profile/avatar
     */
    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate(['avatar' => ['required', 'image', 'max:2048']]);
        $path = $request->file('avatar')->store('avatars', 'public');
        $request->user()->update(['avatar' => $path]);
        return response()->json(['message' => 'Avatar updated', 'avatar' => $path]);
    }
}
