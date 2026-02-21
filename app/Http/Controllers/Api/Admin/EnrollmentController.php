<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreEnrollmentRequest;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class EnrollmentController extends Controller
{
    public function index(User $student): JsonResponse
    {
        abort_if($student->role !== 'student', 404);

        // Return course objects directly so the frontend can use course.id and course.title
        $courses = $student->courses()->select('courses.id', 'courses.title', 'courses.description', 'courses.is_active')->get();

        return response()->json($courses);
    }

    public function store(StoreEnrollmentRequest $request, User $student): JsonResponse
    {
        abort_if($student->role !== 'student', 404);

        $enrolled = [];
        foreach ($request->input('course_ids') as $courseId) {
            $enrollment = Enrollment::firstOrCreate([
                'user_id'   => $student->id,
                'course_id' => $courseId,
            ]);
            $enrolled[] = $enrollment;
        }

        return response()->json(['enrolled' => $enrolled], 201);
    }

    public function destroy(User $student, Course $course): JsonResponse
    {
        abort_if($student->role !== 'student', 404);

        Enrollment::where('user_id', $student->id)
                  ->where('course_id', $course->id)
                  ->delete();

        return response()->json(null, 204);
    }
}
