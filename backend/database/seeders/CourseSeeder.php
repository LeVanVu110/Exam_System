<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        // Xóa dữ liệu cũ để tránh trùng ID
        DB::table('courses')->truncate();

        DB::table('courses')->insert([
            [
                'course_code' => 'CS101',
                'course_name' => 'Lập trình căn bản',
                'category_faculty_id' => 1,
                'category_major_id' => 1,
                'teacher_id' => 1,
                'credits' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'course_code' => 'CS102',
                'course_name' => 'Cấu trúc dữ liệu',
                'category_faculty_id' => 1,
                'category_major_id' => 1,
                'teacher_id' => 2,
                'credits' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'course_code' => 'CS103',
                'course_name' => 'Giải tích 1',
                'category_faculty_id' => 2,
                'category_major_id' => 3,
                'teacher_id' => 3,
                'credits' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'course_code' => 'CS104',
                'course_name' => 'Cơ sở dữ liệu',
                'category_faculty_id' => 1,
                'category_major_id' => 1,
                'teacher_id' => 4,
                'credits' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'course_code' => 'CS105',
                'course_name' => 'Lập trình hướng đối tượng',
                'category_faculty_id' => 1,
                'category_major_id' => 2,
                'teacher_id' => 5,
                'credits' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'course_code' => 'CS106',
                'course_name' => 'Mạng máy tính',
                'category_faculty_id' => 1,
                'category_major_id' => 2,
                'teacher_id' => 6,
                'credits' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'course_code' => 'CS107',
                'course_name' => 'Trí tuệ nhân tạo cơ bản',
                'category_faculty_id' => 1,
                'category_major_id' => 1,
                'teacher_id' => 7,
                'credits' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
