<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamSession extends Model
{
    use HasFactory;

    protected $table = 'exam_sessions';
    protected $fillable = [
        'course_id',
        'exam_name',
        'exam_date',
        'exam_room',
        'exam_duration',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function examStudents()
    {
        return $this->hasMany(ExamStudent::class, 'exam_session_id');
    }
}
