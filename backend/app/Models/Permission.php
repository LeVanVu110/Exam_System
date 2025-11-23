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

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'roles_permissions', 'permission_id', 'role_id');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_permissions', 'permission_id', 'user_id');
    }

    public function screens()
    {
        return $this->belongsToMany(
            Screen::class,         // Model liên kết
            'permissions_screens', // Tên bảng pivot
            'permission_id',       // FK của permission trong pivot
            'screen_id'            // FK của screen trong pivot
        )->withPivot([
            'is_view',
            'is_edit',
            'is_add',
            'is_delete',
            'is_upload',
            'is_download',
            'is_all'
        ]);
    }
}
