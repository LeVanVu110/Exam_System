<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\StudentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Những route này sẽ có prefix /api/ tự động
|--------------------------------------------------------------------------
*/

Route::get('/students', [StudentController::class, 'index']);         // Danh sách sinh viên
Route::get('/students/{id}', [StudentController::class, 'show']);     // Xem chi tiết sinh viên
Route::post('/students', [StudentController::class, 'store']);        // Thêm mới
Route::put('/students/{id}', [StudentController::class, 'update']);   // Cập nhật
Route::delete('/students/{id}', [StudentController::class, 'destroy']); // Xóa
