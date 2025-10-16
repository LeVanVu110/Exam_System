<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamSession extends Model
{
    use HasFactory;

    protected $primaryKey = 'exam_session_id';
    protected $table = 'exam_sessions';

    protected $fillable = [
        'course_id',
        'exam_code',
        'class_code',
        'subject_name',
        'credits',
        'student_class',
        'exam_time',
        'exam_date',
        'exam_room',
        'student_count',
        'exam_duration',
        'exam_method',
        'exam_faculty',
        'education_level',
        'training_system',
        'exam_batch',
        'exam_teacher',
        'assigned_teacher1_id',
        'assigned_teacher2_id',
        'actual_teacher1_id',
        'actual_teacher2_id',
        'status',
        'total_students',
        'total_computers',
        'exam_start_time',
        'exam_end_time',
        'exam_name',
        'created_at',
        'updated_at',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function examStudents()
    {
        return $this->hasMany(ExamStudent::class, 'exam_session_id');
    }

    // tên giáo viên 
    public function assignedTeacher1()
    {
        return $this->belongsTo(Teacher::class, 'assigned_teacher1_id', 'teacher_id');
    }

    public function assignedTeacher2()
    {
        return $this->belongsTo(Teacher::class, 'assigned_teacher2_id', 'teacher_id');
    }
}
