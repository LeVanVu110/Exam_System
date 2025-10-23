<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Báo cáo kỳ thi - {{ $exam->exam_code }}</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            margin: 40px;
            font-size: 14px;
            color: #222;
        }
        h2 {
            text-align: center;
            text-transform: uppercase;
            margin-bottom: 10px;
        }
        h4 {
            text-align: center;
            margin-top: 0;
            font-weight: normal;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 25px;
        }
        th, td {
            border: 1px solid #444;
            padding: 8px;
        }
        th {
            background: #f2f2f2;
            text-align: left;
            width: 35%;
        }
        .footer {
            text-align: right;
            margin-top: 40px;
            font-size: 12px;
            color: #555;
        }
    </style>
</head>
<body>
    <h2>BÁO CÁO KỲ THI</h2>
    <h4>Mã ca thi: {{ $exam->exam_code }}</h4>

    <table>
        <tr>
            <th>Mã lớp học phần</th>
            <td>{{ $exam->class_code }}</td>
        </tr>
        <tr>
            <th>Tên học phần</th>
            <td>{{ $exam->subject_name }}</td>
        </tr>
        <tr>
            <th>Ngày thi</th>
            <td>{{ \Carbon\Carbon::parse($exam->exam_date)->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <th>Giờ thi</th>
            <td>{{ $exam->exam_time ?? '---' }}</td>
        </tr>
        <tr>
            <th>Phòng thi</th>
            <td>{{ $exam->exam_room ?? '---' }}</td>
        </tr>
        <tr>
            <th>Thời lượng</th>
            <td>{{ $exam->exam_duration }} phút</td>
        </tr>
        <tr>
            <th>Số sinh viên</th>
            <td>{{ $exam->student_count }}</td>
        </tr>
        <tr>
            <th>Khoa coi thi</th>
            <td>{{ $exam->exam_faculty ?? '---' }}</td>
        </tr>
        <tr>
            <th>Giảng viên coi thi</th>
            <td>{{ $exam->exam_teacher ?? '---' }}</td>
        </tr>
        <tr>
            <th>Trạng thái</th>
            <td>{{ $exam->status ?? '---' }}</td>
        </tr>
    </table>

    <div class="footer">
        <em>Ngày xuất báo cáo: {{ now()->format('d/m/Y H:i') }}</em>
    </div>
</body>
</html>
