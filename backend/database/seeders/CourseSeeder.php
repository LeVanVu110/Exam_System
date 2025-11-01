<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\Course;
use App\Models\CategoryMajor;
use App\Models\Teacher;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        Course::truncate();
        Schema::enableForeignKeyConstraints();

        $major = CategoryMajor::first();
        $majorId = $major ? $major->category_major_id : 1;

        $teacher = Teacher::first();
        $teacherId = $teacher ? $teacher->teacher_id : 1;

        Course::insert([
            [
                'course_code' => 'C0001',
                'course_name' => 'Lập trình Web cơ bản',
                'category_faculty_id' => $major ? $major->category_faculty_id : 1,
                'category_major_id' => $majorId,
                'teacher_id' => $teacherId,
                'credits' => 3,
            ],
            [
                'course_code' => 'C0002',
                'course_name' => 'Cơ sở dữ liệu',
                'category_faculty_id' => $major ? $major->category_faculty_id : 1,
                'category_major_id' => $majorId,
                'teacher_id' => $teacherId,
                'credits' => 3,
            ],
        ]);
    }
}

