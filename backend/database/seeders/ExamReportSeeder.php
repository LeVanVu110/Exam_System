<?php

namespace Database\Seeders;

use App\Models\ExamReport;
use App\Models\ExamSession;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ExamReportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $exam = ExamSession::first();

        ExamReport::create([
            'exam_session_id' => $exam->id ?? 1,
            'total_students' => 30,
            'average_score' => 7.5,
        ]);
    }
}
