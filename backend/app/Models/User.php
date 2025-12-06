<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\DB; // ✅ THÊM: Import DB

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';
    protected $primaryKey = 'user_id';

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
    ];

    // 🔗 Quan hệ
    // Cho Auth::attempt() hiểu đúng cột password
    public function getAuthPassword()
    {
        return $this->user_password;
    }

    // ❌ ĐÃ XÓA: setUserPasswordAttribute
    // Lý do: UserController đã dùng Hash::make(), nếu để lại sẽ bị mã hóa 2 lần (Double Hashing).

    public function profile()
    {
        return $this->hasOne(UserProfile::class, 'user_id');
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'users_roles', 'user_id', 'role_id');
    }

    // Lấy role chính
    public function primaryRole()
    {
        return $this->roles()->first();
    }

    // ✅ CẬP NHẬT: Hàm hasAccess chuẩn theo SQL đã tạo
    public function hasAccess($screenCode, $permission) // Ví dụ: ('USER_MAN', 'is_view')
    {
        // 1. Luôn cho phép Super Admin (User ID 1) hoặc Role Admin
        if ($this->user_id == 1) return true;

        // 2. Kiểm tra trong DB (Bảng role_permissions)
        // Logic: Lấy tất cả Role của User -> Check xem Role đó có quyền với ScreenCode này không
        foreach ($this->roles as $role) {
            $hasPermission = DB::table('role_permissions')
                ->where('role_id', $role->role_id)
                ->where('screen_code', $screenCode) // Khớp với cột trong DB
                ->where($permission, 1)             // check cột is_view, is_add... = 1
                ->exists();

            if ($hasPermission) return true;
        }

        return false;
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

    public function setUserPasswordAttribute($value)
    {
        $this->attributes['user_password'] = bcrypt($value);
    }
}
