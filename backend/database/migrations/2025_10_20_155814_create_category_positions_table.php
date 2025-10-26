<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('category_positions', function (Blueprint $table) {
            $table->id('category_position_id'); // PK
            $table->string('position_code', 20)->unique();
            $table->string('position_name', 255);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category_positions');
    }
};

