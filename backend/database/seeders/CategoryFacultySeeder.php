<?php

namespace Database\Seeders;

use App\Models\CategoryFaculty;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategoryFacultySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CategoryFaculty::insert([
            ['faculty_name' => 'Công nghệ thông tin'],
            ['faculty_name' => 'Mạng máy tính và truyền thông dữ liệu'],
            ['faculty_name' => 'Điện - Điện tử'],
            ['faculty_name' => 'Cơ khí'],
            ['faculty_name' => 'Xây dựng'],
            ['faculty_name' => 'Ngoại ngữ'],
            ['faculty_name' => 'Quản trị kinh doanh'],
            ['faculty_name' => 'Kinh tế'],
            ['faculty_name' => 'Ngôn ngữ Anh'],
            ['faculty_name' => 'Luật'],
            ['faculty_name' => 'Khoa học ứng dụng'],
            ['faculty_name' => 'Công nghệ sinh học'],
            ['faculty_name' => 'Công nghệ thực phẩm'],
            ['faculty_name' => 'Môi trường'],
            ['faculty_name' => 'Du lịch'],
            ['faculty_name' => 'Tài chính - Ngân hàng'],
            ['faculty_name' => 'Kế toán'],
            ['faculty_name' => 'Truyền thông và thiết kế'],
            ['faculty_name' => 'Công nghệ đa phương tiện'],
            ['faculty_name' => 'Công nghệ kỹ thuật ô tô'],
            ['faculty_name' => 'Công nghệ kỹ thuật điện tử - viễn thông'],
            ['faculty_name' => 'Công nghệ kỹ thuật điều khiển và tự động hóa'],
            ['faculty_name' => 'Công nghệ kỹ thuật cơ điện tử'],
            ['faculty_name' => 'Công nghệ kỹ thuật công trình xây dựng'],
            ['faculty_name' => 'Công nghệ kỹ thuật xây dựng công trình giao thông'],
            ['faculty_name' => 'Công nghệ kỹ thuật môi trường'],
            ['faculty_name' => 'Công nghệ kỹ thuật hóa học'],
            ['faculty_name' => 'Công nghệ kỹ thuật in'],
            ['faculty_name' => 'Công nghệ kỹ thuật vật liệu'],
            ['faculty_name' => 'Kỹ thuật y sinh'],
            ['faculty_name' => 'Kỹ thuật phần mềm'],
            ['faculty_name' => 'Hệ thống thông tin'],
            ['faculty_name' => 'An toàn thông tin'],
            ['faculty_name' => 'Khoa học máy tính'],
            ['faculty_name' => 'Mạng và an ninh mạng'],
        ]);
    }
}
