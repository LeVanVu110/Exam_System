<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CategoryMajor;
use App\Models\CategoryFaculty;

class CategoryMajorSeeder extends Seeder
{
    public function run(): void
    {
        $itFaculty = CategoryFaculty::where('faculty_code', 'CNTT')->first();
        $ktFaculty = CategoryFaculty::where('faculty_code', 'KT')->first();

        CategoryMajor::create([
            'major_code' => 'CS',
            'major_name' => 'Khoa học máy tính',
            'category_faculty_id' => $itFaculty->category_faculty_id,
        ]);

        CategoryMajor::create([
            'major_code' => 'IS',
            'major_name' => 'Hệ thống thông tin',
            'category_faculty_id' => $itFaculty->category_faculty_id,
        ]);

        CategoryMajor::create([
            'major_code' => 'QTKD',
            'major_name' => 'Quản trị kinh doanh',
            'category_faculty_id' => $ktFaculty->category_faculty_id,
        ]);
    }
}
