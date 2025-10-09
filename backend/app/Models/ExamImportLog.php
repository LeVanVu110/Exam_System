<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamImportLog extends Model
{
    use HasFactory;

    protected $table = 'exam_import_log';
    protected $fillable = [
        'import_file',
        'import_status',
        'import_message',
        'imported_at',
    ];

    public function importData()
    {
        return $this->hasMany(ExamImportData::class, 'import_log_id');
    }
}
