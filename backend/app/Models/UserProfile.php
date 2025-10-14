<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    use HasFactory;

    protected $table = 'user_profiles';

    protected $fillable = [
        'user_id',
        'category_user_type_id',
        'user_firstname',
        'user_lastname',
        'user_phone',
        'user_avatar',
        'user_sex',
        'address',
    ];

    // 🔗 Quan hệ
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
