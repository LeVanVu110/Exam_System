<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    // Tên bảng
    protected $table = 'role';

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
        return $this->belongsToMany(Permission::class, 'roles_permissions', 'role_id', 'permission_id');
    }
}
