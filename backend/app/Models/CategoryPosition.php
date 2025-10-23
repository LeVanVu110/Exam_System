<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategoryPosition extends Model
{
    use HasFactory;

    protected $table = 'category_position';
    protected $fillable = ['name', 'description'];

    public function teachers()
    {
        return $this->hasMany(Teacher::class, 'category_position_id');
    }
}
