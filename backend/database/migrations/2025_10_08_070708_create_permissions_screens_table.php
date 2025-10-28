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
        Schema::create('permissions_screens', function (Blueprint $table) {
            $table->increments('permission_screen_id');
            $table->unsignedInteger('permission_id');
            $table->unsignedInteger('screen_id');
            $table->tinyInteger('is_view')->default(0);
            $table->tinyInteger('is_edit')->default(0);
            $table->tinyInteger('is_add')->default(0);
            $table->tinyInteger('is_delete')->default(0);
            $table->tinyInteger('is_upload')->default(0);
            $table->tinyInteger('is_download')->default(0);
            $table->tinyInteger('is_all')->default(0);
            $table->timestamps();


            $table->unique(['permission_id', 'screen_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permissions_screens');
    }
};
