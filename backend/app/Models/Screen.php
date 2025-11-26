<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Screen extends Model
{
    use HasFactory;

    protected $table = 'screens';
    protected $primaryKey = 'screen_id';

    protected $fillable = [
        'screen_name',
        'screen_code',
        'screen_description',
        'category_screen_type_id',
        'screen_parent_id'
    ];
}
