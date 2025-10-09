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
        Schema::create('exam_attendance', function (Blueprint $table) {
            $table->increments('attendance_id');
            $table->unsignedInteger('exam_session_id');
            $table->unsignedInteger('teacher_id')->nullable();
            $table->integer('total_students')->default(0);
            $table->integer('present_count')->default(0);
            $table->integer('total_computers')->default(0);
            $table->integer('used_computers')->default(0);
            $table->timestamps();

            $table->foreign('exam_session_id')->references('exam_session_id')->on('exam_sessions')->onDelete('cascade');
            $table->foreign('teacher_id')->references('teacher_id')->on('teachers')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_attendance');
    }
};
