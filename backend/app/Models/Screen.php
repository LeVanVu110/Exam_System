<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Screen extends Model
{
    // use HasFactory;

    protected $primaryKey = 'screen_id';
    protected $fillable = [
        'category_screen_type_id',
        'screen_parent_id',
        'screen_code',
        'screen_name',
        'screen_description'
    ];

    public function permissions()
    {
        return $this->belongsToMany(
            Permission::class,
            'permissions_screens',
            'screen_id',
            'permission_id'
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
