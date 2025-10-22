<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoryFacultySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('category_faculties')->truncate();

        DB::table('category_faculties')->insert([
            ['faculty_code' => 'CNTT', 'faculty_name' => 'Công nghệ thông tin', 'created_at' => now(), 'updated_at' => now()],
            ['faculty_code' => 'KT', 'faculty_name' => 'Kinh tế', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
