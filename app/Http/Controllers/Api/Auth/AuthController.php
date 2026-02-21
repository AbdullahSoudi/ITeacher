<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $identifier = $request->input('identifier');

        // Try to authenticate: student_code for students, email for admin
        // First try as student_code (most common for students)
        $user = User::where('student_code', $identifier)->first();
        
        // If not found, try as email (for admin)
        if (!$user) {
            $user = User::where('email', $identifier)->first();
        }

        if (! $user || ! Hash::check($request->input('password'), $user->password)) {
            return response()->json([
                'message' => 'بيانات تسجيل الدخول غير صحيحة.',
            ], 422);
        }

        if (! $user->is_active) {
            return response()->json([
                'message' => 'الحساب غير نشط. تواصل مع المعلم.',
            ], 403);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'           => $user->id,
                'name'         => $user->name,
                'role'         => $user->role,
                'student_code' => $user->student_code,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'id'           => $user->id,
            'name'         => $user->name,
            'role'         => $user->role,
            'student_code' => $user->student_code,
            'phone'        => $user->phone,
            'is_active'    => $user->is_active,
        ]);
    }
}
