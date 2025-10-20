<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('exam_sessions', function (Blueprint $table) {
        $table->id('exam_session_id');
        $table->string('exam_code', 50)->unique();
        $table->string('exam_name', 255);
        $table->unsignedBigInteger('course_id');
        $table->unsignedBigInteger('assigned_teacher1_id')->nullable();
        $table->unsignedBigInteger('assigned_teacher2_id')->nullable();
        $table->date('exam_date');
        $table->time('exam_start_time');
        $table->time('exam_end_time');
        $table->string('exam_room', 100)->nullable();
        $table->string('status', 20)->default('scheduled');
        $table->timestamps();
        });

    }
    public function down(): void {
        Schema::dropIfExists('exam_sessions');
    }
};