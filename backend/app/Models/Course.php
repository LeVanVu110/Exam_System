<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $primaryKey = 'course_id';
    protected $table = 'courses';

    protected $fillable = [
        'course_code',
        'course_name',
        'category_faculty_id',
        'category_major_id',
        'teacher_id',
        'credits',
        'semester',
    ];

    // Quan hệ
    public function faculty()
    {
        return $this->belongsTo(CategoryFaculty::class, 'category_faculty_id');
    }

    public function major()
    {
        return $this->belongsTo(CategoryMajor::class, 'category_major_id');
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }
     public function exams()
    {
        return $this->hasMany(ExamSession::class, 'course_id');
    }
}

