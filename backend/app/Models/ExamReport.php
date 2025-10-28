<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamReport extends Model
{
    use HasFactory;

    protected $table = 'exam_reports';
    protected $fillable = [
        'exam_session_id',
        'total_students',
        'attended_students',
        'average_score',
        'remarks',
    ];

    public function session()
    {
        return $this->belongsTo(ExamSession::class, 'exam_session_id');
    }
}
