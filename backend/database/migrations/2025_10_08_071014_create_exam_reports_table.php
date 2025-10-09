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
        Schema::create('exam_reports', function (Blueprint $table) {
            $table->increments('report_id');
            $table->unsignedInteger('exam_session_id');
            $table->integer('expected_submissions')->default(0);
            $table->integer('actual_submissions')->default(0);
            $table->integer('empty_submissions')->default(0);
            $table->tinyInteger('requires_attention')->default(0);
            $table->timestamps();

            $table->foreign('exam_session_id')->references('exam_session_id')->on('exam_sessions')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_reports');
    }
};
