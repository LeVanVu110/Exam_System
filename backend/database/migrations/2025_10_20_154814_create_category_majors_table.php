<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('category_majors', function (Blueprint $table) {
            $table->id('category_major_id');
            $table->string('major_code', 20)->unique();
            $table->string('major_name', 255);
            $table->unsignedBigInteger('category_faculty_id'); // chỉ để ID, không FK
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category_majors');
    }
};
