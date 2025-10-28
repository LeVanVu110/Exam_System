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
        Schema::create('course_students', function (Blueprint $table) {
            $table->increments('course_student_id');
            $table->unsignedInteger('course_id');
            $table->unsignedInteger('student_id');
            $table->timestamps();


            $table->unique(['course_id','student_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_students');
    }
};
