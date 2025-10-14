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
        Schema::create('students', function (Blueprint $table) {
            $table->increments('student_id');
            $table->unsignedInteger('user_profile_id');
            $table->unsignedInteger('category_faculty_id')->nullable();
            $table->unsignedInteger('category_major_id')->nullable();
            $table->float('student_score', 4, 1)->nullable();
            $table->string('student_cv', 255)->nullable();
            $table->timestamps();

            $table->foreign('user_profile_id')->references('user_profile_id')->on('user_profiles')->onDelete('cascade');
            $table->foreign('category_faculty_id')->references('category_faculty_id')->on('category_faculty')->onDelete('set null');
            $table->foreign('category_major_id')->references('category_major_id')->on('category_major')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
