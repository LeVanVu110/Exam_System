<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('roles_permissions', function (Blueprint $table) {
            $table->increments('role_permission_id');
            $table->unsignedInteger('role_id');
            $table->unsignedInteger('permission_id');

            // --- CẬP NHẬT: Thêm các cột quyền chi tiết ---
            $table->boolean('is_view')->default(0);
            $table->boolean('is_add')->default(0);
            $table->boolean('is_edit')->default(0);
            $table->boolean('is_delete')->default(0);
            // ---------------------------------------------

            $table->timestamps();

            $table->unique(['role_id', 'permission_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles_permissions');
    }
};
