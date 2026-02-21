<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'students'    => User::students()->active()->count(),
            'courses'     => Course::active()->count(),
            'lessons'     => Lesson::count(),
            'enrollments' => Enrollment::count(),
            'completions' => LessonProgress::where('is_completed', true)->count(),
        ]);
    }
}
