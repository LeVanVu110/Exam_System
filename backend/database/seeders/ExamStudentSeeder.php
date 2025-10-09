<?php

namespace Database\Seeders;

use App\Models\ExamStudent;
use App\Models\ExamSession;
use App\Models\Student;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ExamStudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $exam = ExamSession::first();
        $students = Student::limit(3)->get();

        foreach ($students as $student) {
            ExamStudent::create([
                'exam_session_id' => $exam->id ?? 1,
                'student_id' => $student->id,
                'score' => rand(50, 100) / 10,
            ]);
        }
    }
}
