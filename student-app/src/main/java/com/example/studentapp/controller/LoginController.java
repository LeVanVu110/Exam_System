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
                            String role = user.getString("role");

                            switch (role) {
                                case "admin":
                                    loadView("/upload-view.fxml", "Trang quản trị");
                                    break;
                                case "teacher":
                                    loadView("/teacher-dashboard.fxml", "Trang giảng viên");
                                    break;
                                case "student":
                                    loadView("/upload-view.fxml", "Trang sinh viên");
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
        URL url = new URL("http://localhost:8006/api/login"); // 🟢 đổi URL nếu khác
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);

        // Gửi dữ liệu JSON
        JSONObject requestBody = new JSONObject();
        requestBody.put("email", username);
        requestBody.put("password", password);

        try (OutputStream os = conn.getOutputStream()) {
            byte[] input = requestBody.toString().getBytes("utf-8");
            os.write(input, 0, input.length);
        }

        // Đọc phản hồi
        StringBuilder response = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"))) {
            String responseLine;
            while ((responseLine = br.readLine()) != null) {
                response.append(responseLine.trim());
            }
        }

        return new JSONObject(response.toString());
    }

    private void loadView(String fxmlPath, String title) {
        try {
            Stage currentStage = (Stage) usernameField.getScene().getWindow();
            FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource(fxmlPath));
            Scene scene = new Scene(fxmlLoader.load(), 800, 600);

            currentStage.setTitle(title);
            currentStage.setScene(scene);
        } catch (IOException e) {
            e.printStackTrace();
            System.err.println("Không thể tải giao diện: " + fxmlPath);
        }
    }
}
