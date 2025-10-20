<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TeacherSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('teachers')->insert([
            [
                'user_profile_id' => 1,
                'category_faculty_id' => 1,
                'category_major_id' => 1,
                'category_position_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_profile_id' => 2,
                'category_faculty_id' => 1,
                'category_major_id' => 1,
                'category_position_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
