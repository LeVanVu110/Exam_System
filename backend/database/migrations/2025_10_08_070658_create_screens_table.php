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
        Schema::create('screens', function (Blueprint $table) {
            $table->increments('screen_id');
            $table->unsignedInteger('category_screen_type_id')->nullable();
            $table->unsignedInteger('screen_parent_id')->nullable();
            $table->string('screen_code', 15)->nullable();
            $table->string('screen_name', 55);
            $table->string('screen_description', 1000)->nullable();
            $table->timestamps();

            // self reference
            $table->foreign('screen_parent_id')->references('screen_id')->on('screens')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('screens');
    }
};
