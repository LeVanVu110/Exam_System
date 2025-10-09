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
        Schema::create('network_drive_config', function (Blueprint $table) {
            $table->increments('config_id');
            $table->string('drive_letter', 5)->nullable();
            $table->string('base_path', 500)->nullable();
            $table->string('exam_path_template', 500)->nullable();
            $table->tinyInteger('auto_detect_empty_files')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('network_drive_config');
    }
};
