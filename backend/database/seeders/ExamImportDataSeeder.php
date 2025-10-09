<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\ExamImportData;
use App\Models\ExamImportLog;

class ExamImportDataSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        ExamImportData::truncate();
        Schema::enableForeignKeyConstraints();

        $log = ExamImportLog::first();
        $importId = $log ? $log->import_id : null;

        ExamImportData::create([
            'import_id' => $importId,
            'class_code' => 'A1',
            'subject_name' => 'Lập trình Web',
            'exam_date' => now()->toDateString(),
            'exam_room' => 'P101',
            'total_students' => 30,
            'assigned_teachers' => 'GV1,GV2',
        ]);
    }
}
