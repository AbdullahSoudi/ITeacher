<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class LessonController extends Controller
{
    public function show(Request $request, Lesson $lesson): JsonResponse
    {
        Gate::authorize('access-lesson', $lesson);

        $user = $request->user();

        $progress = $user->lessonProgress()
            ->where('lesson_id', $lesson->id)
            ->first();

        $lesson->is_completed = $progress?->is_completed ?? false;

        // Determine prev/next lessons in the same course
        $siblings = $lesson->course->lessons->pluck('id')->values();
        $currentIndex = $siblings->search($lesson->id);

        $lesson->prev_lesson_id = $currentIndex > 0 ? $siblings[$currentIndex - 1] : null;
        $lesson->next_lesson_id = $currentIndex < $siblings->count() - 1 ? $siblings[$currentIndex + 1] : null;

        return response()->json($lesson);
    }
}
