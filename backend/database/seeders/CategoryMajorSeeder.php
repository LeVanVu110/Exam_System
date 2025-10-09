<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\CategoryMajor;
use App\Models\CategoryFaculty;

class CategoryMajorSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        CategoryMajor::truncate();
        Schema::enableForeignKeyConstraints();

        $faculty = CategoryFaculty::first();
        $facultyId = $faculty ? $faculty->category_faculty_id : 1;

        CategoryMajor::insert([
            ['major_code' => 'SE', 'major_name' => 'Kỹ thuật phần mềm', 'category_faculty_id' => $facultyId],
            ['major_code' => 'CS', 'major_name' => 'Khoa học máy tính', 'category_faculty_id' => $facultyId],
            ['major_code' => 'IT', 'major_name' => 'Công nghệ thông tin', 'category_faculty_id' => $facultyId],
            ['major_code' => 'DS', 'major_name' => 'Khoa học dữ liệu', 'category_faculty_id' => $facultyId],
            ['major_code' => 'AI', 'major_name' => 'Trí tuệ nhân tạo', 'category_faculty_id' => $facultyId],
            ['major_code' => 'IS', 'major_name' => 'Hệ thống thông tin', 'category_faculty_id' => $facultyId],
            ['major_code' => 'CSM', 'major_name' => 'Mạng máy tính và truyền thông', 'category_faculty_id' => $facultyId],
            ['major_code' => 'SEng', 'major_name' => 'Kỹ thuật máy tính', 'category_faculty_id' => $facultyId],
            ['major_code' => 'CYS', 'major_name' => 'An toàn thông tin', 'category_faculty_id' => $facultyId],
            ['major_code' => 'GDS', 'major_name' => 'Khoa học dữ liệu lớn', 'category_faculty_id' => $facultyId],
        ]);
    }
}
