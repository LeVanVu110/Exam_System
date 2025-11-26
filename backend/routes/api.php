<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\{
    StudentController,
    ExamController,
    ExamSessionController,
    AuthController
};
use App\Http\Controllers\{
    RoleController,
    PermissionController, // Đảm bảo Controller này đã được tạo (xem file dưới)
    UserRoleController,
    RolePermissionController,
    UserPermissionController,
    CategoryUserTypeController,
    AuthLoginController,
    ExamScheduleController
};

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- 1. STUDENT ROUTES ---
Route::get('/students', [StudentController::class, 'index']);
Route::get('/students/{id}', [StudentController::class, 'show']);
Route::post('/students', [StudentController::class, 'store']);
Route::put('/students/{id}', [StudentController::class, 'update']);
Route::delete('/students/{id}', [StudentController::class, 'destroy']);

// --- 2. EXAM SESSION ROUTES ---
Route::prefix('exam-sessions')->group(function () {
    Route::get('/', [ExamSessionController::class, 'index']);
    Route::get('/today', [ExamSessionController::class, 'todayExams']);
    Route::get('/search', [ExamSessionController::class, 'searchByRoom']);
    Route::get('/{id}', [ExamSessionController::class, 'show']);
    Route::post('/import', [ExamSessionController::class, 'importExcel']);
    Route::get('/export', [ExamSessionController::class, 'exportExcel']);
    Route::get('/{id}/report', [ExamSessionController::class, 'exportReport']);
    Route::delete('/{id}', [ExamSessionController::class, 'destroy']);
    Route::post('/delete-bulk', [ExamSessionController::class, 'deleteBulk']);
});

// --- 3. CUSTOM ROUTES CHO HỆ THỐNG PHÂN QUYỀN (REACT APP) ---
// Những route này cần định nghĩa TRƯỚC apiResources để tránh xung đột
Route::get('/screens', [PermissionController::class, 'getScreens']);            // Lấy danh sách màn hình
Route::post('/screens', [PermissionController::class, 'storeScreen']);          // Tạo màn hình mới
Route::get('/permissions/{id}/screens', [PermissionController::class, 'getMatrix']); // Lấy matrix quyền
Route::post('/permissions/{id}/update-matrix', [PermissionController::class, 'updateMatrix']); // Lưu matrix
Route::get('/my-permissions', [PermissionController::class, 'myPermissions']); // Lấy quyền của user hiện tại

// --- 4. CRUD RESOURCES (Hệ thống phân quyền & Lịch thi) ---
Route::apiResources([
    'roles' => RoleController::class,
    'permissions' => PermissionController::class, // Route này sẽ map vào các hàm index, store, show, update, destroy
    'users-roles' => UserRoleController::class,
    'roles-permissions' => RolePermissionController::class,
    'users-permissions' => UserPermissionController::class,
    'category-user-types' => CategoryUserTypeController::class,
    'exam-schedule' => ExamSessionController::class,
]);

// --- 5. OTHER ROUTES ---
Route::post('exam-schedule/save', [ExamSessionController::class, 'saveImported']);
Route::post('login', [AuthLoginController::class, 'login']);

// Group lặp lại cho exam-schedules (nếu bạn cần giữ legacy)
Route::prefix('exam-schedules')->group(function () {
    Route::get('/', [ExamSessionController::class, 'index']);
    Route::post('/import', [ExamSessionController::class, 'importExcel']);
    Route::get('/export', [ExamSessionController::class, 'exportExcel']);
    Route::get('/{id}/report', [ExamSessionController::class, 'exportReport']);
    Route::delete('/{id}', [ExamSessionController::class, 'destroy']);
    Route::post('/delete-bulk', [ExamSessionController::class, 'deleteBulk']);
});

// Đăng nhập web
Route::post('/login', [AuthController::class, 'login']);
