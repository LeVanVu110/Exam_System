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
        // Gọi toàn bộ các Seeder cần thiết
        $this->call([
            // Bảng danh mục
            CategoryUserTypeSeeder::class,
            CategoryFacultySeeder::class,
            CategoryMajorSeeder::class,
            CategoryPositionSeeder::class,

            // Bảng người dùng
            UserSeeder::class,
            UserProfileSeeder::class,
            TeacherSeeder::class,
            // StudentSeeder::class,

            // Bảng khóa học
            CourseSeeder::class,

            

            // Bảng quyền & vai trò
            RoleSeeder::class,
            PermissionSeeder::class,
            UserRoleSeeder::class,
            RolePermissionSeeder::class,
            UserPermissionSeeder::class,

            // Bảng kỳ thi
            ExamSessionSeeder::class,
            // ExamStudentSeeder::class,
            // ExamAttendanceSeeder::class,
            // ExamSubmissionSeeder::class,
            // ExamReportSeeder::class,

            // Bảng cấu hình & import
            // ExamImportLogSeeder::class,
            // ExamImportDataSeeder::class,
            // NetworkDriveConfigSeeder::class,
        ]);
    }
}