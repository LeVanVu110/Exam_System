<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamSession extends Model
{
    use HasFactory;

    protected $primaryKey = 'exam_session_id';
    protected $fillable = [
        'exam_code',
        'exam_name',
        'course_id',
        'exam_date',
        'exam_start_time',
        'exam_end_time',
        'assigned_teacher1_id',
        'assigned_teacher2_id',
        'exam_room',
        'status'
    ];

    // Quan hệ
    public function course() {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }

    public function teacher1() {
    return $this->belongsTo(Teacher::class, 'assigned_teacher1_id', 'teacher_id')
                ->with('userProfile');
    }

    public function teacher2() {
    return $this->belongsTo(Teacher::class, 'assigned_teacher2_id', 'teacher_id')
                ->with('userProfile');
    }

}