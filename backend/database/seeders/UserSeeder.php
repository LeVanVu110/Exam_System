<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\Schema;
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
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        User::truncate();
        Schema::enableForeignKeyConstraints();

        // Admin
        User::create([
            'user_code' => 'U0001',
            'user_name' => 'admin',
            'user_email' => 'admin123@gmail.com',
            'user_password' => 'Admin123@@', // auto hash nhờ setUserPasswordAttribute
            'user_is_activated' => 1,
            'user_is_banned' => 0,
            'user_activate_at' => now(),
        ]);

        // Academic Affairs Office
        User::create([
            'user_code' => 'U0002',
            'user_name' => 'academic',
            'user_email' => 'academic123@gmail.com',
            'user_password' => 'Academic123@@',
            'user_is_activated' => 1,
            'user_is_banned' => 0,
            'user_activate_at' => now(),
        ]);

        $faker = \Faker\Factory::create();

        // 10 users giả (từ U0002 -> U0010)
        for ($i = 2; $i <= 10; $i++) {
            User::create([
                'user_code' => 'U' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'user_name' => $faker->userName,
                'user_email' => $faker->unique()->safeEmail,
                'user_password' => 'password',
                'user_is_activated' => rand(0, 1),
                'user_is_banned' => 0,
                'user_activate_at' => now(),
            ]);
        }
    }
}
