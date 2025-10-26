<?php

namespace Database\Seeders;

use App\Models\Teacher;
use App\Models\UserProfile;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class TeacherSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        Teacher::truncate();
        Schema::enableForeignKeyConstraints();

        $profiles = UserProfile::inRandomOrder()->take(3)->get();
        foreach ($profiles as $profile) {
            Teacher::create([
                'user_profile_id' => $profile->user_profile_id,
                'category_faculty_id' => rand(1, 3),
                'category_major_id' => rand(1, 3),
                'category_position_id' => rand(1, 3),
            ]);
        }
    }
}

