<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class LessonFactory extends Factory
{
    public function definition(): array
    {
        $videoIds = [
            'dQw4w9WgXcQ',
            'jNQXAC9IVRw',
            '9bZkp7q19f0',
            'kJQP7kiw5Fk',
            'RgKAFK5djSk',
        ];

        return [
            'title'       => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'youtube_url' => 'https://www.youtube.com/watch?v=' . fake()->randomElement($videoIds),
            'order'       => 1,
        ];
    }
}
