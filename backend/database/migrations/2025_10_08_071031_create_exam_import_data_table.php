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
        Schema::create('exam_import_data', function (Blueprint $table) {
            $table->increments('import_data_id');
            $table->unsignedInteger('import_id');
            $table->string('class_code', 50)->nullable();
            $table->string('subject_name', 255)->nullable();
            $table->date('exam_date')->nullable();
            $table->string('exam_room', 100)->nullable();
            $table->integer('total_students')->default(0);
            $table->string('assigned_teachers', 500)->nullable();
            $table->timestamps();

            $table->foreign('import_id')->references('import_id')->on('exam_import_log')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_import_data');
    }
};
