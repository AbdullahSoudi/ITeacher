<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;


    public function definition(): array
    {
        return [
            'name'         => fake()->name(),
            'phone'        => fake()->unique()->numerify('05########'),
            'email'        => null,
            'role'         => 'student',
            'student_code' => null,
            'password'     => static::$password ??= Hash::make('password'),
            'is_active'    => true,
        ];
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role'         => 'admin',
            'student_code' => null,
            'phone'        => '0501234567',
            'email'        => 'admin@iteacher.test',
        ]);
    }

    public function student(string $code): static
    {
        return $this->state(fn (array $attributes) => [
            'role'         => 'student',
            'student_code' => $code,
        ]);
    }
}
