<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            UserProfileSeeder::class,
            TeacherSeeder::class,
            StudentSeeder::class,
            RoleSeeder::class,
            PermissionSeeder::class,
            UserRoleSeeder::class,
            RolePermissionSeeder::class,
            UserPermissionSeeder::class,
            ScreenSeeder::class,
            PermissionScreenSeeder::class,
            CategoryUserTypeSeeder::class,
            CategoryFacultySeeder::class,
            CategoryMajorSeeder::class,
            CategoryPositionSeeder::class,
            CourseSeeder::class,
            CourseStudentSeeder::class,
            ExamSessionSeeder::class,
            ExamStudentSeeder::class,
            ExamAttendanceSeeder::class,
            ExamSubmissionSeeder::class,
            ExamReportSeeder::class,
            ExamImportLogSeeder::class,
            ExamImportDataSeeder::class,
            NetworkDriveConfigSeeder::class,
        ]);
    }
}
