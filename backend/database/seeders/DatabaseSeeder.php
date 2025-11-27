<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([

            // =====================================
            // 1. Các bảng danh mục (Loại, Khoa, Ngành...)
            // =====================================
            CategoryUserTypeSeeder::class,
            CategoryFacultySeeder::class,
            CategoryMajorSeeder::class,
            CategoryPositionSeeder::class,

            // =====================================
            // 2. Bảng Users → Profile → Teacher/Student
            // =====================================
            UserSeeder::class,
            UserProfileSeeder::class,
            TeacherSeeder::class,
            StudentSeeder::class,

            // =====================================
            // 3. Phân quyền – CHẠY ĐÚNG THỨ TỰ
            // =====================================
            RoleSeeder::class,             // Tạo danh sách role
            PermissionSeeder::class,       // Tạo danh sách quyền
            RolePermissionSeeder::class,   // Gán quyền → role
            UserRoleSeeder::class,         // Gán role → user (Cách 2 bạn đang dùng)
            UserPermissionSeeder::class,   // Nếu bạn cho user override quyền

            // =====================================
            // 4. Màn hình + quyền màn hình
            // =====================================
            ScreenSeeder::class,
            PermissionScreenSeeder::class,

            // =====================================
            // 5. Khóa học – Lịch thi – Bài thi
            // =====================================
            CourseSeeder::class,
            CourseStudentSeeder::class,

            ExamSessionSeeder::class,
            ExamStudentSeeder::class,
            ExamAttendanceSeeder::class,
            ExamSubmissionSeeder::class,
            ExamReportSeeder::class,
            ExamImportLogSeeder::class,
            ExamImportDataSeeder::class,

            // =====================================
            // 6. Cấu hình hệ thống
            // =====================================
            NetworkDriveConfigSeeder::class,
        ]);
    }
}
