<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';
    protected $primaryKey = 'user_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
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

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'user_password',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    // 🔗 Quan hệ
    //Cho Auth::attempt() hiểu đúng cột password
    public function getAuthPassword()
    {
        return $this->user_password;
    }
    //Tự động mã hóa password khi lưu
    public function setUserPasswordAttribute($value)
    {
        $this->attributes['user_password'] = bcrypt($value);
    }


    public function profile()
    {
        return $this->hasOne(UserProfile::class, 'user_id');
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'users_roles', 'user_id', 'role_id');
    }

    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'user_permissions', 'user_id', 'permission_id');
    }

    // Lấy role chính (vì bạn nói mỗi user 1 role)
    public function primaryRole()
    {
        return $this->roles()->first();
    }

    // Thêm vào app/Models/User.php

    public function hasAccess($permissionName, $accessType = 'is_view')
    {
        // Sửa 'screens' thành 'permissions' (để gọi đúng quan hệ trong Role)
        return $this->roles()->whereHas('permissions', function ($q) use ($permissionName, $accessType) {
            // ✅ SỬA LỖI QUAN TRỌNG TẠI ĐÂY:
            // Database dùng cột 'permission_name', không phải 'screen_code'
            $q->where('permission_name', $permissionName)
              // Kiểm tra cột quyền trong bảng trung gian (roles_permissions)
              ->where("roles_permissions.$accessType", 1);
        })->exists();
    }
    public function getAuthIdentifierName()
    {
        // ✅ Bắt buộc phải là tên cột mà bạn dùng để đăng nhập
        return 'user_email'; 
    }
    public function getAuthPasswordName()
    {
        // ✅ Bắt buộc phải là tên cột mật khẩu trong DB
        return 'user_password'; 
    }
}
