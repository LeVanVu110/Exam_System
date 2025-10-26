<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teachers', function (Blueprint $table) {
            $table->id('teacher_id'); // PK

            // Khóa ngoại
            $table->unsignedBigInteger('user_profile_id'); // FK -> user_profiles
            $table->unsignedBigInteger('category_faculty_id'); // FK -> category_faculties
            $table->unsignedBigInteger('category_major_id'); // FK -> category_majors
            $table->unsignedBigInteger('category_position_id'); // FK -> category_positions

            $table->timestamps();

            
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teachers');
    }
};


