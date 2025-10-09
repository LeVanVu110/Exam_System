<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\Course;
use App\Models\Student;
use App\Models\CourseStudent;

class CourseStudentSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        CourseStudent::truncate();
        Schema::enableForeignKeyConstraints();

        $course = Course::first();
        $courseId = $course ? $course->course_id : 1;

        $students = Student::limit(3)->get();

        foreach ($students as $student) {
            CourseStudent::create([
                'course_id' => $courseId,
                'student_id' => $student->student_id,
            ]);
        }
    }
}
