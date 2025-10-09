<?php

namespace Database\Seeders;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    // U001
    public function run(): void {
        User::truncate();

        // Admin
        User::create([
            'user_code' => 'U0001',
            'user_name' => 'admin',
            'user_email' => 'admin123@gmail.com',
            'user_password' => Hash::make('Admin123@@'),
            'user_is_activated' => 1,
            'user_is_banned' => 0,
            'user_activate_at' => now(),
        ]);

        // 10 users giả
        for ($i = 2; $i <= 10; $i++) {
            User::create([
                'user_code' => 'U' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'user_name' => fake()->userName(),
                'user_email' => fake()->unique()->safeEmail(),
                'user_password' => Hash::make('password'),
                'user_is_activated' => rand(0, 1),
                'user_is_banned' => 0,
                'user_activate_at' => now(),
            ]);
        }
    }
}
