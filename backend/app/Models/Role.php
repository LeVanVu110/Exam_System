<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;
    protected $table = 'roles';
    protected $primaryKey = 'role_id';
    protected $fillable = ['role_name', 'role_description', 'role_is_active'];

    // Quan hệ User - Role
    public function users()
    {
        return $this->belongsToMany(User::class, 'users_roles', 'role_id', 'user_id');
    }

    // [QUAN TRỌNG] Quan hệ Role - Permission (Màn hình)
    // Phải khai báo withPivot đầy đủ các cột thì Controller mới đọc được
    public function permissions() // Hoặc screens() tùy bạn đặt
    {
        // Chú ý: Tên bảng phải là 'roles_permissions' để khớp với file Permission ở trên
        return $this->belongsToMany(Permission::class, 'roles_permissions', 'role_id', 'permission_id')
            ->withPivot('is_view', 'is_add', 'is_edit', 'is_delete', 'is_upload', 'is_download')
            ->withTimestamps();
    }

    // Alias 'screens' để code Controller cũ vẫn chạy được nếu lỡ dùng
    public function screens()
    {
        return $this->permissions();
    }
}
