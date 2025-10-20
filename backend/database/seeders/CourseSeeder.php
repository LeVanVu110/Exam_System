<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        Course::create([
            'course_code' => 'CS101',
            'course_name' => 'Lập trình căn bản',
            'category_faculty_id' => 1,
            'category_major_id' => 1,
            'teacher_id' => 1,
            'credits' => 3,
        ]);
    }
}
