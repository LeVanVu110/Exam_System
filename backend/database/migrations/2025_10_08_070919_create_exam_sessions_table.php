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
        Schema::create('exam_sessions', function (Blueprint $table) {
            $table->increments('exam_session_id');
            $table->string('exam_code', 50)->unique();
            $table->string('exam_name', 255)->nullable();
            $table->unsignedInteger('course_id')->nullable();
            $table->string('class_code', 50)->nullable();
            $table->string('subject_name', 255)->nullable();
            $table->date('exam_date')->nullable();
            $table->time('exam_start_time')->nullable();
            $table->time('exam_end_time')->nullable();
            $table->string('exam_room', 100)->nullable();
            $table->integer('total_students')->default(0);
            $table->integer('total_computers')->default(0);
            $table->unsignedInteger('assigned_teacher1_id')->nullable();
            $table->unsignedInteger('assigned_teacher2_id')->nullable();
            $table->unsignedInteger('actual_teacher1_id')->nullable();
            $table->unsignedInteger('actual_teacher2_id')->nullable();
            $table->string('status', 50)->nullable();
            $table->timestamps();

            $table->foreign('course_id')->references('course_id')->on('courses')->onDelete('set null');
            $table->foreign('assigned_teacher1_id')->references('teacher_id')->on('teachers')->onDelete('set null');
            $table->foreign('assigned_teacher2_id')->references('teacher_id')->on('teachers')->onDelete('set null');
            $table->foreign('actual_teacher1_id')->references('teacher_id')->on('teachers')->onDelete('set null');
            $table->foreign('actual_teacher2_id')->references('teacher_id')->on('teachers')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_sessions');
    }
};
