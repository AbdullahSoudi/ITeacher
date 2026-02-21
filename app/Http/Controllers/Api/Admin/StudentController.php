<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStudentRequest;
use App\Http\Requests\Admin\UpdateStudentRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class StudentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::students()
            ->withCount('enrollments')
            ->latest();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('student_code', 'like', "%{$search}%");
            });
        }

        return response()->json($query->paginate(15));
    }

    public function store(StoreStudentRequest $request): JsonResponse
    {
        $count = User::students()->withTrashed()->count() + 1;
        $code  = 'STU-' . str_pad($count, 4, '0', STR_PAD_LEFT);

        $plainPassword = Str::random(10);

        $student = User::create([
            'name'         => $request->input('name'),
            'phone'        => $request->input('phone'),
            'role'         => 'student',
            'student_code' => $code,
            'password'     => Hash::make($plainPassword),
            'is_active'    => true,
        ]);

        return response()->json([
            'student'            => $student,
            'generated_password' => $plainPassword,
        ], 201);
    }

    public function show(User $student): JsonResponse
    {
        abort_if($student->role !== 'student', 404);

        $student->loadCount('enrollments');
        $student->load('enrollments.course:id,title,is_active');

        return response()->json($student);
    }

    public function update(UpdateStudentRequest $request, User $student): JsonResponse
    {
        abort_if($student->role !== 'student', 404);

        $student->update($request->only('name', 'phone', 'is_active'));

        return response()->json($student);
    }

    public function destroy(User $student): JsonResponse
    {
        abort_if($student->role !== 'student', 404);

        $student->delete();

        return response()->json(null, 204);
    }

    public function resetPassword(User $student): JsonResponse
    {
        abort_if($student->role !== 'student', 404);

        $plainPassword = Str::random(10);
        $student->update(['password' => Hash::make($plainPassword)]);

        return response()->json(['generated_password' => $plainPassword]);
    }
}
