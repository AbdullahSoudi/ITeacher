<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $enrolledCourseIds = $user->enrollments()->pluck('course_id');

        $courses = Course::active()
            ->whereIn('id', $enrolledCourseIds)
            ->withCount('lessons')
            ->get()
            ->map(function (Course $course) use ($user) {
                $totalLessons = $course->lessons_count;
                $completedLessons = $user->lessonProgress()
                    ->whereHas('lesson', fn ($q) => $q->where('course_id', $course->id))
                    ->where('is_completed', true)
                    ->count();

                $course->progress = [
                    'completed' => $completedLessons,
                    'total'     => $totalLessons,
                ];

                return $course;
            });

        return response()->json($courses);
    }

    public function show(Request $request, Course $course): JsonResponse
    {
        Gate::authorize('view-course', $course);

        $user = $request->user();

        $completedLessonIds = $user->lessonProgress()
            ->where('is_completed', true)
            ->pluck('lesson_id')
            ->toArray();

        $lessons = $course->lessons->map(function ($lesson) use ($completedLessonIds) {
            $lesson->is_completed = in_array($lesson->id, $completedLessonIds);
            return $lesson;
        });

        return response()->json([
            'id'          => $course->id,
            'title'       => $course->title,
            'description' => $course->description,
            'is_active'   => $course->is_active,
            'lessons'     => $lessons,
        ]);
    }
}
