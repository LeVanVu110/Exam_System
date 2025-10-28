<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\ExamStudent;
use App\Models\ExamSession;
use App\Models\Student;

class ExamStudentSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        ExamStudent::truncate();
        Schema::enableForeignKeyConstraints();

        $exam = ExamSession::first();
        $examId = $exam ? $exam->exam_session_id : 1;

        $students = Student::limit(3)->get();

        foreach ($students as $student) {
            ExamStudent::create([
                'exam_session_id' => $examId,
                'student_id' => $student->student_id,
                'computer_number' => null,
                'attendance_status' => 'Registered',
                'submission_status' => 'Not submitted',
            ]);
        }
    }
}
