<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\{
    StudentController,
    ExamController,
    ExamSessionController,
    ExamSubmissionController
};
use App\Http\Controllers\{
    RoleController,
    PermissionController,
    UserRoleController,
    RolePermissionController,
    UserPermissionController,
    CategoryUserTypeController,
    AuthLoginController,
    ExamScheduleController
};


// kì thi(phát)


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Những route này sẽ có prefix /api/ tự động
|--------------------------------------------------------------------------
*/
//student
Route::get('/students', [StudentController::class, 'index']);         // Danh sách sinh viên
Route::get('/students/{id}', [StudentController::class, 'show']);     // Xem chi tiết sinh viên
Route::post('/students', [StudentController::class, 'store']);        // Thêm mới
Route::put('/students/{id}', [StudentController::class, 'update']);   // Cập nhật
Route::delete('/students/{id}', [StudentController::class, 'destroy']); // Xóa

// kì thi
Route::prefix('exam-sessions')->group(function () {
    Route::get('/', [ExamSessionController::class, 'index']);                   // Xem tất cả lịch thi
    Route::get('/today', [ExamSessionController::class, 'todayExams']);         // Xem lịch thi hôm nay
    Route::get('/search', [ExamSessionController::class, 'searchByRoom']);      // Tìm kiếm lịch thi
    Route::get('/{id}', [ExamSessionController::class, 'show']);                // Xem chi tiết 1 lịch thi
    Route::post('/import', [ExamSessionController::class, 'importExcel']);      // Import file Excel
    Route::get('/export', [ExamSessionController::class, 'exportExcel']);       // Export Excel
    Route::get('/{id}/report', [ExamSessionController::class, 'exportReport']); // Xuất PDF kết quả
    Route::delete('/{id}', [ExamSessionController::class, 'destroy']);          // xóa 1
    Route::post('/delete-bulk', [ExamSessionController::class, 'deleteBulk']);  //xóa hàng loạt
});

// ✅ Các route CRUD cho hệ thống phân quyền
Route::apiResources([
    'roles' => RoleController::class,
    'permissions' => PermissionController::class,
    'users-roles' => UserRoleController::class,
    'roles-permissions' => RolePermissionController::class,
    'users-permissions' => UserPermissionController::class,
    'category-user-types' => CategoryUserTypeController::class,
    'exam-schedule' => ExamSessionController::class,

]);
Route::post('exam-schedule/save', [ExamSessionController::class, 'saveImported']);
Route::post('login', [AuthLoginController::class, 'login']);

Route::prefix('exam-schedules')->group(function () {
    Route::get('/', [ExamSessionController::class, 'index']);           // Xem tất cả lịch thi
    Route::post('/import', [ExamSessionController::class, 'importExcel']); // Import file Excel
    Route::get('/export', [ExamSessionController::class, 'exportExcel']);  // Export Excel
    Route::get('/{id}/report', [ExamSessionController::class, 'exportReport']); // Xuất PDF kết quả
    Route::delete('/{id}', [ExamSessionController::class, 'destroy']); // xóa 1
    Route::post('/delete-bulk', [ExamSessionController::class, 'deleteBulk']); //xóa hàng loạt
});


Route::prefix('exam-submissions')->group(function () {
    Route::post('/upload', [ExamSubmissionController::class, 'upload']);
    Route::get('/', [ExamSubmissionController::class, 'index']);
    Route::get('/download/{id}', [ExamSubmissionController::class, 'download']);
});
