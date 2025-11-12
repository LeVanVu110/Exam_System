<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('exam_submissions', function (Blueprint $table) {
            $table->id();

            // ID của ca thi (liên kết với bảng exam_sessions)
            $table->unsignedBigInteger('exam_session_id');

            // Thông tin CBCT thu bài
            $table->string('room_name'); // Tên phòng thi, vd: "A101"
            $table->string('exam_time'); // Giờ thi, vd: "07:30"
            $table->integer('student_count'); // Số SV thực tế
            $table->string('collected_by_1')->nullable(); // Tên CBCT 1
            $table->string('collected_by_2')->nullable(); // Tên CBCT 2
            $table->text('notes')->nullable(); // Ghi chú của CBCT

            // Thông tin file đã nộp
            $table->string('file_name'); // Tên file gốc, vd: "A101_07h30_45.zip"
            $table->string('file_path'); // Đường dẫn lưu trên server, vd: "exam_collections/xyz123.zip"

            $table->timestamps(); // Tự động thêm created_at, updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_submissions');
    }
};
