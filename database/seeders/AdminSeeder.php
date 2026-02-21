<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $email    = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');

        if (! $email || ! $password) {
            $this->command->error(
                'ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env before running AdminSeeder.'
            );
            return;
        }

        User::updateOrCreate(
            ['email' => $email, 'role' => 'admin'],
            [
                'name'      => 'المعلم',
                'role'      => 'admin',
                'password'  => Hash::make($password),
                'is_active' => true,
                'phone'     => null,
                'student_code' => null,
            ]
        );

        $this->command->info("✔ Admin account ready: {$email}");
    }
}
