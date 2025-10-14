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
        Schema::create('users', function (Blueprint $table) {
            $table->increments('user_id');
            $table->string('user_code', 25)->nullable();
            $table->string('user_name', 25)->unique();
            $table->string('user_email', 255)->unique();
            $table->string('user_password', 255);
            $table->tinyInteger('user_is_activated')->default(0);
            $table->tinyInteger('user_is_banned')->default(0);
            $table->timestamp('user_activate_at')->nullable();
            $table->timestamp('user_banned_at')->nullable();
            $table->timestamp('user_last_login')->nullable();
            $table->string('user_password_reset_code', 255)->nullable();
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
