<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ==============================================================================
// 1. IMPORT CONTROLLER
// ==============================================================================
use App\Http\Controllers\Api\{
    StudentController,
    ExamController,
    ExamSessionController,
    AuthController,
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
    UserProfileController,
    ScreenController,
    UserController
};

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- 1. PUBLIC ROUTES (Không cần đăng nhập) ---
Route::post('/login', [AuthController::class, 'login']);

// Student routes (Tùy bạn, nếu cần bảo mật thì đưa vào group dưới)
Route::get('/students', [StudentController::class, 'index']);
Route::get('/students/{id}', [StudentController::class, 'show']);
Route::post('/students', [StudentController::class, 'store']);
Route::put('/students/{id}', [StudentController::class, 'update']);
Route::delete('/students/{id}', [StudentController::class, 'destroy']);


// --- 2. PROTECTED ROUTES (Cần Token đăng nhập) ---
Route::middleware('auth:sanctum')->group(function () {

    // A. AUTH & PERMISSIONS
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/my-permissions', [PermissionController::class, 'myPermissions']);

    // B. EXAM SESSIONS (Lịch thi)
    Route::prefix('exam-sessions')->group(function () {
        Route::get('/', [ExamSessionController::class, 'index']);
        Route::get('/today', [ExamSessionController::class, 'todayExams']);
        Route::get('/search', [ExamSessionController::class, 'searchByRoom']);
        Route::post('/import', [ExamSessionController::class, 'importExcel']);
        Route::get('/export', [ExamSessionController::class, 'exportExcel']);
        Route::post('/delete-bulk', [ExamSessionController::class, 'deleteBulk']);
        Route::get('/{id}', [ExamSessionController::class, 'show']);
        Route::get('/{id}/report', [ExamSessionController::class, 'exportReport']);
        Route::delete('/{id}', [ExamSessionController::class, 'destroy']);
    });

    // C. SYSTEM ROUTES (Màn hình & Phân quyền Matrix)
    Route::get('/screens', [ScreenController::class, 'index']);
    Route::post('/screens', [ScreenController::class, 'store']);
    Route::delete('/screens/{id}', [ScreenController::class, 'destroy']);
    Route::get('/roles/{id}/screens', [RoleController::class, 'getScreensByRole']);
    Route::post('/roles/{id}/update-matrix', [RoleController::class, 'updateMatrix']);

    // D. CRUD RESOURCES (QUAN TRỌNG: Đặt User/Profile vào đây mới nhận diện được User)
    Route::apiResources([
        'roles'               => RoleController::class,
        'permissions'         => PermissionController::class,
        'users-roles'         => UserRoleController::class,
        'roles-permissions'   => RolePermissionController::class,
        'category-user-types' => CategoryUserTypeController::class,
        'user-profiles'       => UserProfileController::class, // ✅ Đã được bảo vệ
        'users'               => UserController::class,        // ✅ Đã được bảo vệ
    ]);

    // E. OTHER EXAM ROUTES
    Route::prefix('exam-submissions')->group(function () {
        Route::post('/upload', [ExamSubmissionController::class, 'upload']);
        Route::get('/', [ExamSubmissionController::class, 'index']);
        Route::get('/download/{id}', [ExamSubmissionController::class, 'download']);
    });
});
