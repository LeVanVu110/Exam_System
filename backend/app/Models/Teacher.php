<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    use HasFactory;

    protected $primaryKey = 'teacher_id';
    protected $table = 'teachers';

    protected $fillable = [
        'user_profile_id',
        'category_faculty_id',
        'category_major_id',
        'category_position_id',
    ];

    // Quan hệ với UserProfile
    public function userProfile()
    {
        return $this->belongsTo(UserProfile::class, 'user_profile_id');
    }

    // Quan hệ với CategoryFaculty
    public function faculty()
    {
        return $this->belongsTo(CategoryFaculty::class, 'category_faculty_id');
    }

    // Quan hệ với CategoryMajor
    public function major()
    {
        return $this->belongsTo(CategoryMajor::class, 'category_major_id');
    }

    // Quan hệ với CategoryPosition
    public function position()
    {
        return $this->belongsTo(CategoryPosition::class, 'category_position_id');
    }
}
