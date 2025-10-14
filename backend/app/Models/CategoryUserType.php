<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategoryUserType extends Model
{
    use HasFactory;

    protected $table = 'category_user_types';
    protected $fillable = ['name', 'description'];

    public function profiles()
    {
        return $this->hasMany(UserProfile::class, 'category_user_type_id');
    }
}
