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
        Schema::create('exam_students', function (Blueprint $table) {
            $table->increments('exam_student_id');
            $table->unsignedInteger('exam_session_id');
            $table->unsignedInteger('student_id');
            $table->string('computer_number', 10)->nullable();
            $table->string('attendance_status', 50)->nullable();
            $table->string('submission_status', 50)->nullable();
            $table->timestamps();

            $table->foreign('exam_session_id')->references('exam_session_id')->on('exam_sessions')->onDelete('cascade');
            $table->foreign('student_id')->references('student_id')->on('students')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_students');
    }
};
