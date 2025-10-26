<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategoryFaculty extends Model
{
    use HasFactory;
    protected $table = 'category_faculty';
    protected $primaryKey = 'category_faculty_id';
    protected $fillable = ['faculty_code', 'faculty_name'];

    public function majors()
    {
        return $this->hasMany(CategoryMajor::class, 'category_faculty_id');
    }
}

