<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\ExamSession;
use App\Models\Course;

class ExamSessionSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        ExamSession::truncate();
        Schema::enableForeignKeyConstraints();

        $course = Course::first();
        $courseId = $course ? $course->course_id : null;

        ExamSession::insert([
            [
                'exam_code' => 'EX' . uniqid(),
                'exam_name' => 'Giữa kỳ',
                'course_id' => $courseId,
                'class_code' => 'A1',
                'subject_name' => 'Lập trình Web',
                'exam_date' => now()->addDays(10)->toDateString(),
                'exam_start_time' => null,
                'exam_end_time' => null,
                'exam_room' => 'P101',
                'total_students' => 0,
                'total_computers' => 0,
                'status' => 'Scheduled',
                'assigned_teacher1_id' => null,
                'assigned_teacher2_id' => null,
                'actual_teacher1_id' => null,
                'actual_teacher2_id' => null,
            ],
            [
                'exam_code' => 'EX' . uniqid(),
                'exam_name' => 'Cuối kỳ',
                'course_id' => $courseId,
                'class_code' => 'A1',
                'subject_name' => 'Lập trình Web',
                'exam_date' => now()->addDays(30)->toDateString(),
                'exam_start_time' => null,
                'exam_end_time' => null,
                'exam_room' => 'P101',
                'total_students' => 0,
                'total_computers' => 0,
                'status' => 'Scheduled',
                'assigned_teacher1_id' => null,
                'assigned_teacher2_id' => null,
                'actual_teacher1_id' => null,
                'actual_teacher2_id' => null,
            ],
        ]);
    }
}
