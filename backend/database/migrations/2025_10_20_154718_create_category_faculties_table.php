<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('category_faculties', function (Blueprint $table) {
            $table->id('category_faculty_id');
            $table->string('faculty_code', 20)->unique();
            $table->string('faculty_name', 255);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category_faculties');
    }
};

