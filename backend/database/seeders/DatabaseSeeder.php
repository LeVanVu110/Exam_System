<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

use Illuminate\Support\Facades\DB;
class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // ====== Các bảng danh mục (category, type, v.v.) chạy TRƯỚC ======
            CategoryUserTypeSeeder::class,
            CategoryFacultySeeder::class,
            CategoryMajorSeeder::class,
            CategoryPositionSeeder::class,

            // ====== Các bảng user và liên quan đến user ======
            UserSeeder::class,
            UserProfileSeeder::class,
            TeacherSeeder::class,
            StudentSeeder::class,

            // ====== Các bảng phân quyền ======
            RoleSeeder::class,
            PermissionSeeder::class,
            UserRoleSeeder::class,
            RolePermissionSeeder::class,
            UserPermissionSeeder::class,
            ScreenSeeder::class,
            PermissionScreenSeeder::class,

            // ====== Các bảng khóa học và thi cử ======
            CourseSeeder::class,
            CourseStudentSeeder::class,
            ExamSessionSeeder::class,
            ExamStudentSeeder::class,
            ExamAttendanceSeeder::class,
            ExamSubmissionSeeder::class,
            ExamReportSeeder::class,
            ExamImportLogSeeder::class,
            ExamImportDataSeeder::class,

            // ====== Cấu hình hệ thống ======
            NetworkDriveConfigSeeder::class,
        ]);
    }
}
