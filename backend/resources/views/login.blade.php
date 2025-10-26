<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Login API</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 400px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
        h1 { text-align: center; color: #333; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input[type="email"], input[type="password"] { width: 100%; padding: 10px; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
        button { width: 100%; padding: 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        button:hover { background-color: #0056b3; }
        #result { margin-top: 20px; padding: 15px; border-radius: 4px; background-color: #e9ecef; border: 1px solid #ced4da; white-space: pre-wrap; word-wrap: break-word; }
        .success { background-color: #d4edda; color: #155724; border-color: #c3e6cb; }
        .error { background-color: #f8d7da; color: #721c24; border-color: #f5c6cb; }
    </style>
</head>
<body>

<div class="container">
    <h1>Test Đăng Nhập API</h1>
    <form id="loginForm">
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" value="admin@gmail.com" required> 

        <label for="password">Mật khẩu:</label>
        <input type="password" id="password" name="password" value="123456" required>

        <button type="submit">Đăng Nhập</button>
    </form>

    <h2>Kết quả:</h2>
    <div id="result">
        // Kết quả trả về sẽ hiển thị ở đây
    </div>
</div>

<script>
    const loginForm = document.getElementById('loginForm');
    const resultDiv = document.getElementById('result');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // **THAY ĐỔI URL NÀY CHO PHÙ HỢP VỚI ROUTE CỦA BẠN**
        // Ví dụ: Nếu route của bạn là /api/login, hãy dùng nó.
        const url = '/api/login'; 

        resultDiv.className = '';
        resultDiv.innerHTML = 'Đang gửi yêu cầu...';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Nếu bạn dùng CSRF token cho route web, cần thêm dòng này:
                    // 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({ email: email, password: password })
            });

            const data = await response.json();

            if (response.ok) { // Kiểm tra mã trạng thái HTTP (ví dụ: 200)
                resultDiv.classList.add('success');
                resultDiv.innerHTML = 'Đăng nhập thành công!\n\n' + JSON.stringify(data, null, 2);
            } else { // Xử lý các lỗi HTTP (ví dụ: 401, 422)
                resultDiv.classList.add('error');
                resultDiv.innerHTML = `Lỗi ${response.status}: ${data.message || 'Lỗi không xác định'}\n\n` + JSON.stringify(data, null, 2);
            }

        } catch (error) {
            resultDiv.classList.add('error');
            resultDiv.innerHTML = 'Lỗi kết nối hoặc xử lý: ' + error.message;
            console.error('Fetch error:', error);
        }
    });
</script>

</body>
</html>