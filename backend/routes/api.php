<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Gọi các controller
use App\Http\Controllers\{
    RoleController,
    PermissionController,
    UserRoleController,
    RolePermissionController,
    UserPermissionController,
    CategoryUserTypeController,
    ExamSessionController,
};

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Các route trong file này sẽ tự động có prefix "/api".
| Ví dụ: GET /api/roles → gọi đến RoleController@index
|
*/

// ✅ Kiểm tra API hoạt động
Route::get('/ping', function () {
    return response()->json(['message' => 'API đang hoạt động!']);
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
