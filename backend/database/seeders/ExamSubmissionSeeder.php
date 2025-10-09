<?php
//file excel import
namespace Database\Seeders;

use App\Models\ExamSubmission;
use App\Models\ExamStudent;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ExamSubmissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $examStudents = ExamStudent::all();

        foreach ($examStudents as $examStudent) {
            ExamSubmission::create([
                'exam_student_id' => $examStudent->id,
                'file_path' => 'submissions/' . uniqid() . '.pdf',
                'submitted_at' => now(),
            ]);
        }
    }
}
