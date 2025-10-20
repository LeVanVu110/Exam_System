<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    use HasFactory;

    protected $primaryKey = 'user_profile_id';
    protected $table = 'user_profiles';

    protected $fillable = [
        'user_id',
        'category_user_type_id',
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

    // Quan hệ với bảng Users
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Quan hệ với bảng Category_User_Type
    public function categoryUserType()
    {
        return $this->belongsTo(CategoryUserType::class, 'category_user_type_id');
    }
}
