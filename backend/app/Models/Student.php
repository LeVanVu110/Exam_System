<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $primaryKey = 'student_id';
    public $timestamps = true;

    protected $fillable = [
        'user_profile_id',
        'category_faculty_id',
        'category_major_id',
        'student_score',
        'student_cv',
    ];

    public function userProfile()
    {
        return $this->belongsTo(UserProfile::class, 'user_profile_id', 'user_profile_id');
    }

    public function faculty()
    {
        return $this->belongsTo(CategoryFaculty::class, 'category_faculty_id', 'category_faculty_id');
    }

    public function major()
    {
        return $this->belongsTo(CategoryMajor::class, 'category_major_id', 'category_major_id');
    }
}
