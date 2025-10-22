<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::truncate();

        User::create([
            'user_code' => 'U001',
            'user_name' => 'admin',
            'user_email' => 'admin@example.com',
            'user_password' => Hash::make('123456'),
            'user_is_activated' => 1,
            'user_is_banned' => 0,
            'user_activate_at' => now(),
            'user_last_login' => now(),
        ]);

        User::create([
            'user_code' => 'U002',
            'user_name' => 'teacher1',
            'user_email' => 'teacher1@example.com',
            'user_password' => Hash::make('123456'),
            'user_is_activated' => 1,
            'user_is_banned' => 0,
            'user_activate_at' => now(),
        ]);
    }
}
