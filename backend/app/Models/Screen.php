<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Screen extends Model
{
    use HasFactory;

    protected $table = 'screens';
    protected $fillable = ['screen_name', 'screen_code', 'screen_description'];
}
