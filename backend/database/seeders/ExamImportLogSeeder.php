<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\ExamImportLog;

class ExamImportLogSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        ExamImportLog::truncate();
        Schema::enableForeignKeyConstraints();

        ExamImportLog::create([
            'file_name' => 'import_scores.xlsx',
            'imported_by' => null,
            'total_rows' => 100,
            'success_rows' => 100,
            'import_status' => 'Success',
        ]);
    }
}
