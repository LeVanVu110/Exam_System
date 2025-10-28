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
        Schema::create('category_major', function (Blueprint $table) {
            $table->increments('category_major_id');
            $table->string('major_code', 20)->nullable();
            $table->string('major_name', 255);
            $table->unsignedInteger('category_faculty_id')->nullable();
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('category_major');
    }
};
