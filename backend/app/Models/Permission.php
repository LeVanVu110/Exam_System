<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    use HasFactory;

    protected $table = 'permissions';
    protected $primaryKey = 'permission_id';

    protected $fillable = [
        'permission_name',
        'permission_description',
        'permission_is_active',
    ];

    // Định nghĩa quan hệ ngược lại với Role
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'roles_permissions', 'permission_id', 'role_id')
                    ->withPivot('is_view', 'is_add', 'is_edit', 'is_delete')
                    ->withTimestamps();
    }
}
