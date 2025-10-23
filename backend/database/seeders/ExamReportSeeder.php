<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\ExamReport;
use App\Models\ExamSession;
use App\Models\ExamStudent;

class ExamReportSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        ExamReport::truncate();
        Schema::enableForeignKeyConstraints();

        $exam = ExamSession::first();
        $examId = $exam ? $exam->exam_session_id : 1;

        $expected = ExamStudent::where('exam_session_id', $examId)->count();
        $actual = rand(0, $expected ?: 10);

        ExamReport::create([
            'exam_session_id' => $examId,
            'expected_submissions' => $expected,
            'actual_submissions' => $actual,
            'empty_submissions' => max(0, $expected - $actual),
            'requires_attention' => ($actual < $expected) ? 1 : 0,
        ]);
    }
}
