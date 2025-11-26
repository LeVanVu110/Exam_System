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
    // [QUAN TRỌNG] Import Controller mới và đặt tên khác (Alias) để không trùng
    UserPermissionController as ApiUserPermissionController
};

// ==============================================================================
// 2. IMPORT CONTROLLER QUẢN LÝ (CRUD Dashboard)
// ==============================================================================
use App\Http\Controllers\{
    RoleController,
    PermissionController,
    UserRoleController,
    RolePermissionController,
    UserPermissionController, // Controller cũ (không có Alias) dùng cho trang quản trị
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

// [QUAN TRỌNG] Route này dùng Controller API (có Alias)
Route::get('/my-permissions', [ApiUserPermissionController::class, 'getMyPermissions']);

Route::get('/screens', [PermissionController::class, 'getScreens']);
Route::post('/screens', [PermissionController::class, 'storeScreen']);
Route::get('/permissions/{id}/screens', [PermissionController::class, 'getMatrix']);
Route::post('/permissions/{id}/update-matrix', [PermissionController::class, 'updateMatrix']);


// --- 4. CRUD RESOURCES (Dùng Controller thường) ---
Route::apiResources([
    'roles' => RoleController::class,
    'permissions' => PermissionController::class,
    'users-roles' => UserRoleController::class,
    'roles-permissions' => RolePermissionController::class,
    'users-permissions' => UserPermissionController::class, // Dùng Controller thường
    'category-user-types' => CategoryUserTypeController::class,
    'exam-schedule' => ExamSessionController::class,
]);

// --- 5. OTHER ROUTES ---
Route::post('exam-schedule/save', [ExamSessionController::class, 'saveImported']);
// Group lặp lại cho exam-schedules (nếu bạn cần giữ legacy)
Route::prefix('exam-schedules')->group(function () {
    Route::get('/', [ExamSessionController::class, 'index']);
    Route::post('/import', [ExamSessionController::class, 'importExcel']);
    Route::get('/export', [ExamSessionController::class, 'exportExcel']);
    Route::get('/{id}/report', [ExamSessionController::class, 'exportReport']);
    Route::delete('/{id}', [ExamSessionController::class, 'destroy']);
    Route::post('/delete-bulk', [ExamSessionController::class, 'deleteBulk']);
});

// Đăng nhập
Route::post('/login', [AuthController::class, 'login']);
