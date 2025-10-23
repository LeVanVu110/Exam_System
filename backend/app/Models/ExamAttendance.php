<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamAttendance extends Model
{
    use HasFactory;

    protected $table = 'exam_attendance';
    protected $fillable = [
        'exam_student_id',
        'attendance_time',
        'status',
    ];

    public function examStudent()
    {
        return $this->belongsTo(ExamStudent::class, 'exam_student_id');
    }
}
