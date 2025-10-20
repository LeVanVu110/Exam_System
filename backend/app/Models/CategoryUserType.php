<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategoryUserType extends Model
{
    use HasFactory;

    protected $primaryKey = 'category_user_type_id';
    protected $fillable = [
        'user_type_code',
        'user_type_name',
    ];
}
