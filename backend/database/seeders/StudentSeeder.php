<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\UserProfile;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
       Student::truncate();

        $profiles = UserProfile::inRandomOrder()->take(5)->get();
        foreach ($profiles as $profile) {
            Student::create([
                'user_profile_id' => $profile->user_profile_id,
                'category_faculty_id' => rand(1, 3),
                'category_major_id' => rand(1, 3),
                'student_score' => rand(50, 100) / 10,
                'student_cv' => fake()->url(),
            ]);
        }
    }
}
