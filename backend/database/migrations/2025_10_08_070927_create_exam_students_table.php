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
