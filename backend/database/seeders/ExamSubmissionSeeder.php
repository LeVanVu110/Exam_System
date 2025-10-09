<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\ExamSubmission;
use App\Models\ExamSession;
use App\Models\Student;

class ExamSubmissionSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        ExamSubmission::truncate();
        Schema::enableForeignKeyConstraints();

        $exam = ExamSession::first();
        $examId = $exam ? $exam->exam_session_id : 1;

        $students = Student::limit(3)->get();

        foreach ($students as $student) {
            ExamSubmission::create([
                'exam_session_id' => $examId,
                'student_id' => $student->student_id,
                'network_file_path' => 'submissions/' . uniqid() . '.pdf',
                'file_name' => 'submission_' . $student->student_id . '.pdf',
                'file_size' => rand(1000, 50000),
                'submission_status' => 'Submitted',
            ]);
        }
    }
}
