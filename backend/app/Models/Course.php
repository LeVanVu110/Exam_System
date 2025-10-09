<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $table = 'courses';
    protected $fillable = [
        'course_code',
        'course_name',
        'teacher_id',
        'category_major_id',
        'credit',
        'semester',
    ];

    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, 'course_students', 'course_id', 'student_id');
    }

    public function exams()
    {
        return $this->hasMany(ExamSession::class, 'course_id');
    }
}
