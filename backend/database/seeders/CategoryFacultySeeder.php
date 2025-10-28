<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\CategoryFaculty;

class CategoryFacultySeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        CategoryFaculty::truncate();
        Schema::enableForeignKeyConstraints();

        CategoryFaculty::insert([
            ['faculty_code' => 'CNTT', 'faculty_name' => 'Công nghệ thông tin'],
            ['faculty_code' => 'KT', 'faculty_name' => 'Kinh tế'],
            ['faculty_code' => 'ANH', 'faculty_name' => 'Ngôn ngữ Anh'],
        ]);
    }
}

