<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('category_user_type', function (Blueprint $table) {
            $table->id('category_user_type_id');
            $table->string('user_type_code', 20)->unique();
            $table->string('user_type_name', 255);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('category_user_type');
    }
};
