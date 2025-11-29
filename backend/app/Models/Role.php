<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    // Tên bảng
    protected $table = 'roles';

    // Khóa chính
    protected $primaryKey = 'role_id';

    // Cho phép tự động tăng
    public $incrementing = true;

    // Kiểu khóa chính
    protected $keyType = 'int';

    // Các trường có thể gán giá trị hàng loạt
    protected $fillable = [
        'role_name',
        'role_description',
        'role_is_active',
    ];

    // Quan hệ với bảng trung gian user_roles
    public function users()
    {
        return $this->belongsToMany(User::class, 'users_roles', 'role_id', 'user_id');
    }

    // Quan hệ với permissions (thông qua bảng roles_permissions)
    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'roles_permissions', 'role_id', 'permission_id')
            ->withPivot('is_view', 'is_add', 'is_edit', 'is_delete')
            ->withTimestamps();
    }

    // [ĐÃ SỬA] Quan hệ Role - Screen (Tận dụng bảng roles_permissions có sẵn)
    public function screens()
    {
        // Lưu ý: Chúng ta map 'screen_id' của Model Screen vào cột 'permission_id' của bảng trung gian
        return $this->belongsToMany(Screen::class, 'roles_permissions', 'role_id', 'permission_id')
            ->withPivot('is_view', 'is_add', 'is_edit', 'is_delete', 'is_upload', 'is_download');
    }
}
