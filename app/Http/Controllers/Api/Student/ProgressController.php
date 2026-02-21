<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ProgressController extends Controller
{
    public function complete(Request $request, Lesson $lesson): JsonResponse
    {
        Gate::authorize('complete-lesson', $lesson);

        $progress = LessonProgress::updateOrCreate(
            [
                'user_id'   => $request->user()->id,
                'lesson_id' => $lesson->id,
            ],
            [
                'is_completed' => true,
                'completed_at' => now(),
            ]
        );

        return response()->json([
            'message'      => 'تم تسجيل الدرس كمكتمل.',
            'is_completed' => true,
            'completed_at' => $progress->completed_at,
        ]);
    }
}
