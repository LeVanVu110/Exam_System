<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamImportData extends Model
{
    use HasFactory;

    protected $table = 'exam_import_data';
    protected $fillable = [
        'import_log_id',
        'row_number',
        'data',
        'status',
        'error_message',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function importLog()
    {
        return $this->belongsTo(ExamImportLog::class, 'import_log_id');
    }
}
