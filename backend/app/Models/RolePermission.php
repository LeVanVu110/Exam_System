<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RolePermission extends Model
{
    use HasFactory;
    protected $table = 'roles_permissions';
    protected $primaryKey = 'role_permission_id';
    protected $fillable = [
        'role_id',
        'permission_id',
        'is_view',
        'is_add',
        'is_edit',
        'is_delete',
        'is_upload',   // 👈 Phải có dòng này
        'is_download', // 👈 Phải có dòng này
    ];

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function permission()
    {
        return $this->belongsTo(Permission::class, 'permission_id');
    }
}

