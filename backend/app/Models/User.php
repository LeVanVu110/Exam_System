<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    use HasFactory;

    protected $primaryKey = 'user_id';
    protected $table = 'users';

    protected $fillable = [
        'user_code',
        'user_name',
        'user_email',
        'user_password',
        'user_is_activated',
        'user_is_banned',
        'user_activate_at',
        'user_banned_at',
        'user_last_login',
        'user_password_reset_code',
    ];

    protected $hidden = [
        'user_password',
        'user_password_reset_code',
    ];

    // Liên kết với hồ sơ người dùng
    public function profile()
    {
        return $this->hasOne(UserProfile::class, 'user_id');
    }

    // Liên kết với vai trò
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'users_roles', 'user_id', 'role_id');
    }
}
