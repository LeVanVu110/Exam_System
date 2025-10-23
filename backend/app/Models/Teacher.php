<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    use HasFactory;

    protected $table = 'teachers';
    protected $primaryKey = 'teacher_id';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable = [
        'user_id',
        'user_profile_id',
        'category_faculty_id',
        'category_position_id',
        'teacher_code',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function userProfile()
    {
        return $this->belongsTo(UserProfile::class, 'user_profile_id', 'user_profile_id');
    }
}
