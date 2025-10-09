<?php

namespace Database\Seeders;

use App\Models\CategoryUserType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategoryUserTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CategoryUserType::insert([
            ['user_type_code' => 'ADMIN', 'user_type_name' => 'Admin'],
            ['user_type_code' => 'AAO', 'user_type_name' => 'Academic Affairs Office'],
            ['user_type_code' => 'TEACHER', 'user_type_name' => 'Teacher'],
            ['user_type_code' => 'STUDENT', 'user_type_name' => 'Student'],
        ]);
    }
}
