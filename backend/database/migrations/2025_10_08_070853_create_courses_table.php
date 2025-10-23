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
        Schema::create('courses', function (Blueprint $table) {
            $table->increments('course_id');
            $table->string('course_code', 20)->unique();
            $table->string('course_name', 255);
            $table->unsignedInteger('category_faculty_id')->nullable();
            $table->unsignedInteger('category_major_id')->nullable();
            $table->unsignedInteger('teacher_id')->nullable();
            $table->integer('credits')->default(0);
            $table->timestamps();

            $table->foreign('category_faculty_id')->references('category_faculty_id')->on('category_faculty')->onDelete('set null');
            $table->foreign('category_major_id')->references('category_major_id')->on('category_major')->onDelete('set null');
            $table->foreign('teacher_id')->references('teacher_id')->on('teachers')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
