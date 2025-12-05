<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    use HasFactory;

    protected $table = 'user_profiles';
    protected $primaryKey = 'user_profile_id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'user_id',
        'role_id',
        'user_firstname',
        'user_lastname',
        'user_phone',
        'user_device_token',
        'user_avatar',
        'user_sex',
        'province_id',
        'district_id',
        'ward_id',
        'address',
    ];

    // 🔗 Quan hệ
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
    public function teacher()
    {
        return $this->hasOne(Teacher::class, 'user_profile_id', 'user_profile_id');
    }
    // Quan hệ với bảng roles
    public function roleUserType()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

}
