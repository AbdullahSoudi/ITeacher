<?php

namespace App\Providers;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Student can view a course only if enrolled and course is active
        Gate::define('view-course', function (User $user, Course $course) {
            return $user->enrollments()
                        ->where('course_id', $course->id)
                        ->exists()
                && $course->is_active;
        });

        // Student can access a lesson only if enrolled in its course and course is active
        Gate::define('access-lesson', function (User $user, Lesson $lesson) {
            return $user->enrollments()
                        ->where('course_id', $lesson->course_id)
                        ->exists()
                && $lesson->course->is_active;
        });

        // Student can mark a lesson complete only if they can access it
        Gate::define('complete-lesson', function (User $user, Lesson $lesson) {
            return $user->enrollments()
                        ->where('course_id', $lesson->course_id)
                        ->exists()
                && $lesson->course->is_active;
        });
    }
}
