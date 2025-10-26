<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('permissions', function (Blueprint $table) {
            $table->id('permission_id');
            $table->string('permission_name', 55);
            $table->string('permission_description', 1000)->nullable();
            $table->tinyInteger('permission_is_active')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('permissions');
    }
};
