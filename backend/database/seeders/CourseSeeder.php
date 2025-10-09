<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CategoryMajor;
use App\Models\Teacher;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $major = CategoryMajor::first();
        $teacher = Teacher::first();

        Course::insert([
            [
                'name' => 'Lập trình Web cơ bản',
                'major_id' => $major->id ?? 1,
                'teacher_id' => $teacher->id ?? 1,
                'credit' => 3,
            ],
            [
                'name' => 'Cơ sở dữ liệu',
                'major_id' => $major->id ?? 1,
                'teacher_id' => $teacher->id ?? 1,
                'credit' => 3,
            ],
        ]);
    }
}
