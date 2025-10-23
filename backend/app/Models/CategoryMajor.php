<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategoryMajor extends Model
{
    use HasFactory;

    protected $table = 'category_major';
    protected $fillable = ['name', 'category_faculty_id', 'description'];

    public function faculty()
    {
        return $this->belongsTo(CategoryFaculty::class, 'category_faculty_id');
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'category_major_id');
    }
}
