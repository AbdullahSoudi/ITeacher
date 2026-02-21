<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreLessonRequest;
use App\Http\Requests\Admin\UpdateLessonRequest;
use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;

class LessonController extends Controller
{
    public function index(Course $course): JsonResponse
    {
        return response()->json($course->lessons);
    }

    public function store(StoreLessonRequest $request, Course $course): JsonResponse
    {
        $maxOrder = $course->lessons()->max('order') ?? 0;

        $lesson = $course->lessons()->create([
            'title'       => $request->input('title'),
            'youtube_url' => $request->input('youtube_url'),
            'description' => $request->input('description'),
            'order'       => $request->input('order', $maxOrder + 1),
        ]);

        return response()->json($lesson, 201);
    }

    public function update(UpdateLessonRequest $request, Lesson $lesson): JsonResponse
    {
        $lesson->update($request->only('title', 'youtube_url', 'description', 'order'));

        return response()->json($lesson);
    }

    public function destroy(Lesson $lesson): JsonResponse
    {
        $lesson->delete();

        return response()->json(null, 204);
    }
}
