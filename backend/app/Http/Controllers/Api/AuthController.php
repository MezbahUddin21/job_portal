<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\CompanyProfile;
use App\Models\CandidateProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * POST /api/auth/register
     */
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'         => ['required', 'string', 'max:255'],
            'email'        => ['required', 'email', 'unique:users'],
            'password'     => ['required', 'confirmed', Password::defaults()],
            'role'         => ['required', 'in:employer,candidate'],
            'phone'        => ['nullable', 'string', 'max:20'],
            // Employer fields
            'company_name' => ['required_if:role,employer', 'nullable', 'string', 'max:255'],
            'industry'     => ['required_if:role,employer', 'nullable', 'string'],
            'location'     => ['required_if:role,employer', 'nullable', 'string'],
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'role'     => $data['role'],
            'phone'    => $data['phone'] ?? null,
        ]);

        // Auto-create role-specific profile
        if ($user->isEmployer()) {
            CompanyProfile::create([
                'user_id'      => $user->id,
                'company_name' => $data['company_name'],
                'industry'     => $data['industry'],
                'location'     => $data['location'],
            ]);
        } else {
            CandidateProfile::create(['user_id' => $user->id]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'user'    => $this->userResource($user),
            'token'   => $token,
        ], 201);
    }

    /**
     * POST /api/auth/login
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = Auth::user();

        if (!$user->is_active) {
            Auth::logout();
            return response()->json(['message' => 'Account has been deactivated.'], 403);
        }

        $user->tokens()->delete(); // Single active session
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user'    => $this->userResource($user),
            'token'   => $token,
        ]);
    }

    /**
     * POST /api/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * GET /api/auth/me
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['companyProfile', 'candidateProfile']);
        return response()->json(['user' => $this->userResource($user)]);
    }

    /**
     * PUT /api/auth/change-password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required'],
            'password'         => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);
        return response()->json(['message' => 'Password changed successfully']);
    }

    // ── Private helper ──────────────────────────────────────────────────────────
    private function userResource(User $user): array
    {
        $data = [
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'role'       => $user->role,
            'phone'      => $user->phone,
            'avatar'     => $user->avatar,
            'is_active'  => $user->is_active,
            'created_at' => $user->created_at,
        ];

        if ($user->isEmployer() && $user->relationLoaded('companyProfile')) {
            $data['company_profile'] = $user->companyProfile;
        }

        if ($user->isCandidate() && $user->relationLoaded('candidateProfile')) {
            $data['candidate_profile'] = $user->candidateProfile;
        }

        return $data;
    }
}
