<?php

use App\Http\Controllers\Api\Admin\CourseController as AdminCourseController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\EnrollmentController;
use App\Http\Controllers\Api\Admin\LessonController as AdminLessonController;
use App\Http\Controllers\Api\Admin\StudentController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Student\CourseController as StudentCourseController;
use App\Http\Controllers\Api\Student\LessonController as StudentLessonController;
use App\Http\Controllers\Api\Student\ProgressController;
use Illuminate\Support\Facades\Route;

// ─── Auth ────────────────────────────────────────────────────────────────────
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',     [AuthController::class, 'me']);
});

// ─── Admin ────────────────────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Students
    Route::get('/students',                              [StudentController::class, 'index']);
    Route::post('/students',                             [StudentController::class, 'store']);
    Route::get('/students/{student}',                    [StudentController::class, 'show']);
    Route::put('/students/{student}',                    [StudentController::class, 'update']);
    Route::delete('/students/{student}',                 [StudentController::class, 'destroy']);
    Route::post('/students/{student}/reset-password',    [StudentController::class, 'resetPassword']);

    // Enrollments (per student)
    Route::get('/students/{student}/enrollments',        [EnrollmentController::class, 'index']);
    Route::post('/students/{student}/enroll',            [EnrollmentController::class, 'store']);
    Route::delete('/students/{student}/enroll/{course}', [EnrollmentController::class, 'destroy']);

    // Courses
    Route::get('/courses',                          [AdminCourseController::class, 'index']);
    Route::post('/courses',                         [AdminCourseController::class, 'store']);
    Route::get('/courses/{course}',                 [AdminCourseController::class, 'show']);
    Route::put('/courses/{course}',                 [AdminCourseController::class, 'update']);
    Route::delete('/courses/{course}',              [AdminCourseController::class, 'destroy']);
    Route::get('/courses/{course}/students',        [AdminCourseController::class, 'students']);

    // Lessons (nested under course for create; standalone for update/delete)
    Route::get('/courses/{course}/lessons',  [AdminLessonController::class, 'index']);
    Route::post('/courses/{course}/lessons', [AdminLessonController::class, 'store']);
    Route::put('/lessons/{lesson}',          [AdminLessonController::class, 'update']);
    Route::delete('/lessons/{lesson}',       [AdminLessonController::class, 'destroy']);
});

// ─── Student ──────────────────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'student'])->prefix('student')->group(function () {
    Route::get('/courses',          [StudentCourseController::class, 'index']);
    Route::get('/courses/{course}', [StudentCourseController::class, 'show']);
    Route::get('/lessons/{lesson}', [StudentLessonController::class, 'show']);
    Route::post('/lessons/{lesson}/complete', [ProgressController::class, 'complete']);
});
