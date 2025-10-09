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
        Schema::create('exam_import_log', function (Blueprint $table) {
            $table->increments('import_id');
            $table->string('file_name', 255)->nullable();
            $table->unsignedInteger('imported_by')->nullable();
            $table->integer('total_rows')->default(0);
            $table->integer('success_rows')->default(0);
            $table->string('import_status', 50)->nullable();
            $table->timestamps();

            $table->foreign('imported_by')->references('user_id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_import_log');
    }
};
