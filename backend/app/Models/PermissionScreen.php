<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PermissionScreen extends Model
{
    use HasFactory;

    protected $table = 'permissions_screens';
    protected $fillable = ['permission_id', 'screen_id'];
}
