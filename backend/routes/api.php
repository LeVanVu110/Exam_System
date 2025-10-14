<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ExamSessionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Các route trong file này sẽ tự động có prefix "/api".
| Ví dụ: GET /api/exam-sessions sẽ trỏ tới ExamSessionController@index
|
*/

// ✅ Kiểm tra API có hoạt động
Route::get('/ping', function () {
    return response()->json(['message' => 'API is running ✅']);
});

// ✅ Lấy danh sách tất cả buổi thi
Route::get('/exam-sessions', [ExamSessionController::class, 'index']);

// ✅ Lấy chi tiết 1 buổi thi theo ID
Route::get('/exam-sessions/{id}', [ExamSessionController::class, 'show']);

// ✅ Thêm buổi thi mới
Route::post('/exam-sessions', [ExamSessionController::class, 'store']);

// ✅ Cập nhật thông tin buổi thi
Route::put('/exam-sessions/{id}', [ExamSessionController::class, 'update']);

// ✅ Xóa buổi thi
Route::delete('/exam-sessions/{id}', [ExamSessionController::class, 'destroy']);

