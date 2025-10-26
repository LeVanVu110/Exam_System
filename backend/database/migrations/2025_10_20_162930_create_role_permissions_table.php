<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('roles_permissions', function (Blueprint $table) {
            $table->id('role_permission_id');
            $table->unsignedBigInteger('role_id');
            $table->unsignedBigInteger('permission_id');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles_permissions');
    }
};
