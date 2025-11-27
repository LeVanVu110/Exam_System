<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;
use App\Models\User;
use Faker\Factory as Faker;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        User::truncate();
        DB::table('users_roles')->truncate(); // <-- thêm dòng này
        Schema::enableForeignKeyConstraints();

        $faker = Faker::create();

        // =========================
        // 1. Admin
        // =========================
        $admin = User::create([
            'user_code' => 'U0001',
            'user_name' => 'admin',
            'user_email' => 'admin123@gmail.com',
            'user_password' => 'Admin123@@',
            'user_is_activated' => 1,
            'user_is_banned' => 0,
            'user_activate_at' => now(),
        ]);

        $admin->roles()->attach(1); // Admin


        // =========================
        // 2. Academic Affairs Office
        // =========================
        $academic = User::create([
            'user_code' => 'U0002',
            'user_name' => 'academic',
            'user_email' => 'academic123@gmail.com',
            'user_password' => 'Academic123@@',
            'user_is_activated' => 1,
            'user_is_banned' => 0,
            'user_activate_at' => now(),
        ]);

        $academic->roles()->attach(4); // Academic Affairs Office


        // =========================
        // 3. Teacher (Giáo viên)
        // =========================
        $teacher = User::create([
            'user_code' => 'U0003',
            'user_name' => 'teacher1',
            'user_email' => 'teacher1@gmail.com',
            'user_password' => 'Teacher123@@',
            'user_is_activated' => 1,
            'user_is_banned' => 0,
            'user_activate_at' => now(),
        ]);

        $teacher->roles()->attach(2); // Role Teacher


        // =========================
        // 4. Student (Học sinh)
        // =========================
        $student = User::create([
            'user_code' => 'U0004',
            'user_name' => 'student1',
            'user_email' => 'student1@gmail.com',
            'user_password' => 'Student123@@',
            'user_is_activated' => 1,
            'user_is_banned' => 0,
            'user_activate_at' => now(),
        ]);

        $student->roles()->attach(3); // Role Student


        // =========================
        // 5. Các User ngẫu nhiên → TẤT CẢ đều là Student
        // =========================
        for ($i = 5; $i <= 12; $i++) {

            $user = User::create([
                'user_code' => 'U' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'user_name' => $faker->userName,
                'user_email' => $faker->unique()->safeEmail,
                'user_password' => 'password',
                'user_is_activated' => rand(0, 1),
                'user_is_banned' => 0,
                'user_activate_at' => now(),
            ]);

            // Tất cả random user phía dưới đều gán role Student
            $user->roles()->attach(3);
        }
    }
}
