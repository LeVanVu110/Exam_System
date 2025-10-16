<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Báo cáo kỳ thi</title>
    <style>
        body { font-family: DejaVu Sans; }
        .title { text-align: center; font-size: 20px; margin-bottom: 20px; }
        .footer { margin-top: 40px; text-align: right; }
    </style>
</head>
<body>
    <div class="title">BÁO CÁO KẾT QUẢ KỲ THI</div>
    <p><strong>Mã ca thi:</strong> {{ $exam->exam_code }}</p>
    <p><strong>Môn học:</strong> {{ $exam->subject_name }}</p>
    <p><strong>Ngày thi:</strong> {{ $exam->exam_date }}</p>
    <p><strong>Phòng thi:</strong> {{ $exam->exam_room }}</p>

    <div class="footer">
        <p>TP.HCM, ngày {{ date('d/m/Y') }}</p>
        <p><strong>Phòng Đào Tạo</strong></p>
        <br><br>
        <p><i>(Ký tên)</i></p>
    </div>
</body>
</html>
