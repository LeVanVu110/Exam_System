<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamStudent extends Model
{
    use HasFactory;

    protected $table = 'exam_students';
    protected $fillable = [
        'exam_session_id',
        'student_id',
        'seat_number',
        'status',
    ];

    public function session()
    {
        return $this->belongsTo(ExamSession::class, 'exam_session_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function submission()
    {
        return $this->hasOne(ExamSubmission::class, 'exam_student_id');
    }
}
