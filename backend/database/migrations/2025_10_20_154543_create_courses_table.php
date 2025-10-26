<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id('course_id'); // PK
            $table->string('course_code', 20)->unique();
            $table->string('course_name', 255);

            // Foreign keys
            $table->unsignedBigInteger('category_faculty_id');
            $table->unsignedBigInteger('category_major_id');
            $table->unsignedBigInteger('teacher_id');
            $table->integer('credits');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};


