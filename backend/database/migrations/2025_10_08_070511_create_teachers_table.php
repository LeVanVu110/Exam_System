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
        Schema::create('teachers', function (Blueprint $table) {
            $table->increments('teacher_id');
            $table->unsignedInteger('user_profile_id');
            $table->unsignedInteger('category_faculty_id')->nullable();
            $table->unsignedInteger('category_major_id')->nullable();
            $table->unsignedInteger('category_position_id')->nullable();
            $table->timestamps();

            $table->foreign('user_profile_id')->references('user_profile_id')->on('user_profiles')->onDelete('cascade');
            $table->foreign('category_faculty_id')->references('category_faculty_id')->on('category_faculty')->onDelete('set null');
            $table->foreign('category_major_id')->references('category_major_id')->on('category_major')->onDelete('set null');
            $table->foreign('category_position_id')->references('category_position_id')->on('category_position')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teachers');
    }
};
