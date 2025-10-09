<?php

namespace Database\Seeders;

use App\Models\ExamImportLog;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ExamImportLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ExamImportLog::create([
            'file_name' => 'import_scores.xlsx',
            'import_date' => now(),
            'status' => 'Success',
        ]);
    }
}
