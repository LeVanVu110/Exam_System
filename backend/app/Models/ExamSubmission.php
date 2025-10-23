<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamSubmission extends Model
{
    use HasFactory;

    protected $table = 'exam_submissions';
    protected $fillable = [
        'exam_student_id',
        'file_path',
        'submitted_at',
    ];

    public function examStudent()
    {
        return $this->belongsTo(ExamStudent::class, 'exam_student_id');
    }
}
