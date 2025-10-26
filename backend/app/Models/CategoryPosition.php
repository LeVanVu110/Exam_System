<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategoryPosition extends Model
{
    use HasFactory;

    protected $primaryKey = 'category_position_id';
    protected $table = 'category_positions';

    protected $fillable = [
        'position_code',
        'position_name',
    ];

    // Quan hệ với Teacher
    public function teachers()
    {
        return $this->hasMany(Teacher::class, 'category_position_id');
    }
}

