<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCourseRequest;
use App\Http\Requests\Admin\UpdateCourseRequest;
use App\Models\Course;
use Illuminate\Http\JsonResponse;

class CourseController extends Controller
{
    public function index(): JsonResponse
    {
        $courses = Course::withCount(['lessons', 'enrollments'])
            ->latest()
            ->paginate(15);

        return response()->json($courses);
    }

    public function store(StoreCourseRequest $request): JsonResponse
    {
        $course = Course::create([
            'title'       => $request->input('title'),
            'description' => $request->input('description'),
            'is_active'   => $request->boolean('is_active', true),
        ]);

        return response()->json($course, 201);
    }

    public function show(Course $course): JsonResponse
    {
        $course->load('lessons');

        return response()->json($course);
    }

    public function update(UpdateCourseRequest $request, Course $course): JsonResponse
    {
        $course->update($request->only('title', 'description', 'is_active'));

        return response()->json($course);
    }

    public function destroy(Course $course): JsonResponse
    {
        $course->delete();

        return response()->json(null, 204);
    }

    public function students(Course $course): JsonResponse
    {
        $students = $course->students()
            ->select('users.id', 'users.name', 'users.phone', 'users.student_code', 'users.is_active')
            ->get();

        return response()->json($students);
    }
}
