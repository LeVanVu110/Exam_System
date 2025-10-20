<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CategoryFaculty;

class CategoryFacultySeeder extends Seeder
{
    public function run(): void
    {
        CategoryFaculty::create([
            'faculty_code' => 'CNTT',
            'faculty_name' => 'Công nghệ thông tin',
        ]);

        CategoryFaculty::create([
            'faculty_code' => 'KT',
            'faculty_name' => 'Kinh tế',
        ]);
    }
}
