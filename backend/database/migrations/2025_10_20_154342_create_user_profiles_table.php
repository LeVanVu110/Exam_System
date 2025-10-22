<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id('user_profile_id'); // PK
            $table->unsignedBigInteger('user_id'); // FK -> users
            $table->unsignedBigInteger('category_user_type_id'); // FK -> category_user_types

            $table->string('user_firstname', 55)->nullable();
            $table->string('user_lastname', 55)->nullable();
            $table->string('user_phone', 15)->nullable();
            $table->string('user_device_token', 255)->nullable();
            $table->string('user_avatar', 255)->nullable();
            $table->tinyInteger('user_sex')->nullable(); // 0: Nữ, 1: Nam, 2: Khác

            $table->unsignedBigInteger('province_id')->nullable();
            $table->unsignedBigInteger('district_id')->nullable();
            $table->unsignedBigInteger('ward_id')->nullable();
            $table->string('address', 255)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};


