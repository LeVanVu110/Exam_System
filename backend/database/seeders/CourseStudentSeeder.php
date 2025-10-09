<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Student;
use App\Models\CourseStudent;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CourseStudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $course = Course::first();
        $students = Student::limit(3)->get();

        foreach ($students as $student) {
            CourseStudent::create([
                'course_id' => $course->id ?? 1,
                'student_id' => $student->id,
            ]);
        }
    }
}
