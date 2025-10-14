<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    use HasFactory;

    protected $table = 'teachers';

    protected $fillable = [
        'user_id',
        'category_faculty_id',
        'category_position_id',
        'teacher_code',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
