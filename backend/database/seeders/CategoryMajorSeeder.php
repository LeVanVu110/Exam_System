<?php

namespace Database\Seeders;

use App\Models\CategoryMajor;
use App\Models\CategoryFaculty;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategoryMajorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faculty = CategoryFaculty::first();

        CategoryMajor::insert([
            ['faculty_id' => $faculty->id ?? 1, 'name' => 'Kỹ thuật phần mềm'],
            ['faculty_id' => $faculty->id ?? 1, 'name' => 'Khoa học máy tính'],
        ]);
    }
}
