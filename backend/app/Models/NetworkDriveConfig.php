<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NetworkDriveConfig extends Model
{
    use HasFactory;

    protected $table = 'network_drive_config';
    protected $fillable = [
        'server_name',
        'ip_address',
        'username',
        'password',
        'shared_path',
    ];

    protected $hidden = ['password'];
}
