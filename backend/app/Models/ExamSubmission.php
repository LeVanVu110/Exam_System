<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_session_id',
        'room_name',
        'exam_time',
        'student_count',
        'collected_by_1',
        'collected_by_2',
        'notes',
        'file_name',
        'file_path',
    ];
}
