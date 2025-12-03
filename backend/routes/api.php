<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ==============================================================================
// 1. IMPORT CONTROLLER API (Dành cho Frontend/Mobile)
// ==============================================================================
use App\Http\Controllers\Api\{
    StudentController,
    ExamController,
    ExamSessionController,
    AuthController,
    ExamSubmissionController
};

// ==============================================================================
// 2. IMPORT CONTROLLER QUẢN LÝ (CRUD Dashboard)
// ==============================================================================
use App\Http\Controllers\{
    RoleController,
    PermissionController,
    UserRoleController,
    RolePermissionController,
    UserPermissionController,
    CategoryUserTypeController,
    AuthLoginController,
    ExamScheduleController,
    UserProfileController,
    ScreenController // Đảm bảo đã import ScreenController
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
Route::prefix('exam-sessions')->middleware('auth:sanctum')->group(function () {
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

// --- 3. CUSTOM ROUTES CHO HỆ THỐNG PHÂN QUYỀN ---

// [SỬA LẠI ĐOẠN NÀY]
// Sử dụng ScreenController thay vì PermissionController để tận dụng logic tạo tự động
Route::get('/screens', [ScreenController::class, 'index']);
Route::post('/screens', [ScreenController::class, 'store']);
Route::delete('/screens/{id}', [ScreenController::class, 'destroy']);

// Route xử lý Matrix phân quyền (RoleController)
Route::get('/roles/{id}/screens', [RoleController::class, 'getScreensByRole']);
Route::post('/roles/{id}/update-matrix', [RoleController::class, 'updateMatrix']);


// --- 4. CRUD RESOURCES ---
Route::apiResources([
    'roles' => RoleController::class,
    'permissions' => PermissionController::class,
    'users-roles' => UserRoleController::class,
    'roles-permissions' => RolePermissionController::class,
    'category-user-types' => CategoryUserTypeController::class,
    'exam-schedule' => ExamSessionController::class,
    'user-profiles'         => UserProfileController::class,
]);

// --- 5. OTHER ROUTES ---
Route::post('exam-schedule/save', [ExamSessionController::class, 'saveImported']);

Route::prefix('exam-schedules')->group(function () {
    Route::get('/', [ExamSessionController::class, 'index']);
    Route::post('/import', [ExamSessionController::class, 'importExcel']);
    Route::get('/export', [ExamSessionController::class, 'exportExcel']);
    Route::get('/{id}/report', [ExamSessionController::class, 'exportReport']);
    Route::delete('/{id}', [ExamSessionController::class, 'destroy']);
    Route::post('/delete-bulk', [ExamSessionController::class, 'deleteBulk']);
});

// Đăng nhập / Đăng xuất
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/my-permissions', [PermissionController::class, 'myPermissions']); // Dùng PermissionController mới
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::prefix('exam-submissions')->group(function () {
    Route::post('/upload', [ExamSubmissionController::class, 'upload']);
    Route::get('/', [ExamSubmissionController::class, 'index']);
    Route::get('/download/{id}', [ExamSubmissionController::class, 'download']);
});
