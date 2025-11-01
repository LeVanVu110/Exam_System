package com.example.studentapp.controller;

import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.stage.Stage;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import org.json.JSONObject; // ⚠️ Thêm thư viện JSON nếu chưa có (org.json:json trong pom.xml)

public class LoginController {

    @FXML
    private TextField usernameField;
    @FXML
    private PasswordField passwordField;
    @FXML
    private Label messageLabel;

    @FXML
    private void handleLogin() {
        String username = usernameField.getText();
        String password = passwordField.getText();

        messageLabel.setText("Đang đăng nhập...");
        messageLabel.setStyle("-fx-text-fill: gray;");

        // 🧵 Tạo luồng riêng để tránh đơ giao diện
        new Thread(() -> {
            try {
                JSONObject response = sendLoginRequest(username, password);

                // ⚠️ Gọi lại UI phải nằm trong Platform.runLater
                javafx.application.Platform.runLater(() -> {
                    try {
                        if (response.getBoolean("success")) {
                            JSONObject user = response.getJSONObject("user");
                            String role = user.getString("user_role");

                            switch (role) {
                                case "Admin":
                                    loadView("view/login/upload-view.fxml", "Trang quản trị");
                                    break;
                                case "Teacher":
                                    loadView("view/login/upload-view.fxml", "Trang giảng viên");
                                    break;
                                case "Student":
                                    loadView("/view/Main.fxml", "Trang sinh viên");
                                    break;
                                default:
                                    messageLabel.setText("Không xác định vai trò người dùng.");
                                    messageLabel.setStyle("-fx-text-fill: red;");
                            }
                        } else {
                            messageLabel.setText("Sai tài khoản hoặc mật khẩu.");
                            messageLabel.setStyle("-fx-text-fill: red;");
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                        messageLabel.setText("Lỗi xử lý phản hồi server.");
                        messageLabel.setStyle("-fx-text-fill: red;");
                    }
                });

            } catch (Exception e) {
                e.printStackTrace();
                javafx.application.Platform.runLater(() -> {
                    messageLabel.setText("Không thể kết nối tới server.");
                    messageLabel.setStyle("-fx-text-fill: red;");
                });
            }
        }).start(); // 🔹 Chạy thread
    }

    private JSONObject sendLoginRequest(String username, String password) throws IOException {
        URL url = new URL("http://localhost:8000/api/login"); // 🟢 đổi URL nếu khác
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);
        conn.setConnectTimeout(5000);

        // Gửi dữ liệu JSON
        JSONObject requestBody = new JSONObject();
        requestBody.put("email", username);
        requestBody.put("password", password);

        try (OutputStream os = conn.getOutputStream()) {
            byte[] input = requestBody.toString().getBytes("utf-8");
            os.write(input, 0, input.length);
        }
        // Chọn luồng đầu vào dựa trên mã trạng thái
        InputStream is;
        int status = conn.getResponseCode();

        if (status >= 200 && status < 300) {
            // Mã thành công (200 OK)
            is = conn.getInputStream();
        } else {
            // Mã lỗi (401, 500,...) -> Đọc từ ErrorStream
            is = conn.getErrorStream();
            if (is == null) {
                throw new IOException("Server returned status code: " + status + " and no error stream.");
            }
        }

        // Đọc phản hồi (SỬA DÒNG NÀY ĐỂ DÙNG BIẾN 'is')
        StringBuilder response = new StringBuilder();
        // ------------------------------------------------------------------
        try (BufferedReader br = new BufferedReader(new InputStreamReader(is, "utf-8"))) { // ✅ ĐÃ DÙNG 'is'
            // ------------------------------------------------------------------
            String responseLine;
            while ((responseLine = br.readLine()) != null) {
                response.append(responseLine.trim());
            }
        }
        // Nếu phản hồi rỗng (dù có mã lỗi), ném lỗi
        if (response.length() == 0) {
            throw new IOException("Empty response received from server with status: " + status);
        }

        return new JSONObject(response.toString());
    }

    // LoginController.java (Phần cuối)

    private void loadView(String fxmlPath, String title) {
        try {
            Stage currentStage = (Stage) usernameField.getScene().getWindow();

            // ✅ Lấy URL thay vì InputStream — để FXMLLoader có base location
            URL fxmlUrl = getClass().getResource(fxmlPath);
            if (fxmlUrl == null) {
                throw new FileNotFoundException("FXML file not found at path: " + fxmlPath);
            }

            FXMLLoader fxmlLoader = new FXMLLoader(fxmlUrl);
            Scene scene = new Scene(fxmlLoader.load());
            currentStage.setMinWidth(1000);
            currentStage.setMinHeight(700);
            currentStage.setWidth(1000);
            currentStage.setHeight(700);

            currentStage.setTitle(title);
            currentStage.setScene(scene);
            currentStage.centerOnScreen();
            currentStage.show();
        } catch (IOException e) {
            e.printStackTrace();
            System.err.println("Không thể tải giao diện: " + fxmlPath);
            throw new RuntimeException("Lỗi tải FXML: " + fxmlPath, e);
        }
    }

}
