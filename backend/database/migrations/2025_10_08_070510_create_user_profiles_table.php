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
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->increments('user_profile_id');
            $table->unsignedInteger('user_id');
            $table->unsignedInteger('category_user_type_id')->nullable();
            $table->string('user_firstname', 55)->nullable();
            $table->string('user_lastname', 55)->nullable();
            $table->string('user_phone', 30)->nullable();
            $table->string('user_device_token', 255)->nullable();
            $table->string('user_avatar', 255)->nullable();
            $table->tinyInteger('user_sex')->nullable();
            $table->unsignedInteger('province_id')->nullable();
            $table->unsignedInteger('district_id')->nullable();
            $table->unsignedInteger('ward_id')->nullable();
            $table->string('address', 255)->nullable();
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
