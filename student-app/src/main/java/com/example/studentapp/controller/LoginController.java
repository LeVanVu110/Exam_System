package com.example.studentapp.controller;

import com.example.studentapp.service.TokenManager;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.control.CheckBox;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.stage.Stage;
import org.json.JSONObject;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.prefs.Preferences;

public class LoginController {

    @FXML
    private TextField usernameField;
    @FXML
    private PasswordField passwordField;
    @FXML
    private Label messageLabel;
    @FXML
    private CheckBox rememberCheckBox;

    // Các hằng số lưu trữ Preferences
    private Preferences prefs;
    private static final String PREF_NODE_NAME = "com/example/studentapp/login";
    private static final String PREF_USER = "username";
    private static final String PREF_PASS = "password";
    private static final String PREF_REMEMBER = "rememberMe";

    // ✅ MỚI: Key để lưu Token xác thực
    private static final String PREF_TOKEN = "userToken";

    @FXML
    public void initialize() {
        prefs = Preferences.userRoot().node(PREF_NODE_NAME);

        // Tải thông tin đã lưu (nếu có)
        String savedUsername = prefs.get(PREF_USER, "");
        boolean savedRemember = prefs.getBoolean(PREF_REMEMBER, false);

        // Nếu từng nhớ tài khoản, tự động điền (tùy chọn: password có thể không điền để bảo mật)
        if (savedRemember) {
            usernameField.setText(savedUsername);
            String savedPass = prefs.get(PREF_PASS, "");
            passwordField.setText(savedPass);
        }

        rememberCheckBox.setSelected(savedRemember);
    }

    @FXML
    private void handleLogin() {
        String username = usernameField.getText();
        String password = passwordField.getText();
        String requiredDomain = "@gmail.com";

        // --- VALIDATION INPUT ---
        if (!username.toLowerCase().endsWith(requiredDomain)) {
            messageLabel.setText("Email phải có đuôi là " + requiredDomain);
            messageLabel.setStyle("-fx-text-fill: red;");
            return;
        }
        if (username.isEmpty()) {
            messageLabel.setText("Vui lòng nhập Email.");
            messageLabel.setStyle("-fx-text-fill: red;");
            return;
        }
        if (password.isEmpty()) {
            messageLabel.setText("Vui lòng nhập Mật khẩu.");
            messageLabel.setStyle("-fx-text-fill: red;");
            return;
        }

        // --- UI LOADING ---
        messageLabel.setText("Đang đăng nhập...");
        messageLabel.setStyle("-fx-text-fill: gray;");

        // --- GỌI API TRONG LUỒNG RIÊNG ---
        new Thread(() -> {
            try {
                JSONObject response = sendLoginRequest(username, password);

                Platform.runLater(() -> {
                    try {
                        // Kiểm tra response
                        if (!response.has("role")) {
                            String errorMsg = response.has("message")
                                    ? response.getString("message")
                                    : "Đăng nhập thất bại.";
                            messageLabel.setText(errorMsg);
                            messageLabel.setStyle("-fx-text-fill: red;");
                            return;
                        }

                        // ✅ LẤY TOKEN TỪ RESPONSE
                        String token = "";
                        if (response.has("access_token")) {
                            token = response.getString("access_token");
                        } else if (response.has("token")) {
                            token = response.getString("token");
                        }

                        if (token.isEmpty()) {
                            messageLabel.setText("Server không trả về token!");
                            messageLabel.setStyle("-fx-text-fill: red;");
                            return;
                        }

                        // ✅ LẤY ROLE
                        String role = response.getString("role");

                        // ✅ LƯU TOKEN VÀO TOKEN MANAGER (QUAN TRỌNG!)
                        TokenManager.getInstance().saveToken(token, role);

                        // ✅ XỬ LÝ REMEMBER ME
                        if (rememberCheckBox.isSelected()) {
                            prefs.put(PREF_USER, username);
                            prefs.put(PREF_PASS, password);
                            prefs.putBoolean(PREF_REMEMBER, true);
                        } else {
                            prefs.remove(PREF_USER);
                            prefs.remove(PREF_PASS);
                            prefs.putBoolean(PREF_REMEMBER, false);
                        }

                        messageLabel.setText("✓ Đăng nhập thành công!");
                        messageLabel.setStyle("-fx-text-fill: green;");

                        // ✅ CHUYỂN MÀN HÌNH
                        loadMainView(role);

                    } catch (Exception e) {
                        e.printStackTrace();
                        messageLabel.setText("Lỗi xử lý dữ liệu server.");
                        messageLabel.setStyle("-fx-text-fill: red;");
                    }
                });

            } catch (Exception e) {
                e.printStackTrace();
                Platform.runLater(() -> {
                    messageLabel.setText("Không thể kết nối tới server.");
                    messageLabel.setStyle("-fx-text-fill: red;");
                });
            }
        }).start();
    }

    private JSONObject sendLoginRequest(String username, String password) throws IOException {
        // Địa chỉ API Laravel
        URL url = new URL("http://localhost:8000/api/login");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("Accept", "application/json"); // Báo cho Laravel trả về JSON
        conn.setDoOutput(true);
        conn.setConnectTimeout(5000);

        // Tạo body JSON gửi đi
        JSONObject requestBody = new JSONObject();
        requestBody.put("email", username);
        requestBody.put("password", password);

        try (OutputStream os = conn.getOutputStream()) {
            byte[] input = requestBody.toString().getBytes("utf-8");
            os.write(input, 0, input.length);
        }

        // Đọc phản hồi
        InputStream is;
        int status = conn.getResponseCode();
        if (status >= 200 && status < 300) {
            is = conn.getInputStream();
        } else {
            is = conn.getErrorStream();
        }

        StringBuilder response = new StringBuilder();
        if (is != null) {
            try (BufferedReader br = new BufferedReader(new InputStreamReader(is, "utf-8"))) {
                String line;
                while ((line = br.readLine()) != null)
                    response.append(line.trim());
            }
        }

        if (response.length() == 0) return new JSONObject("{}");

        return new JSONObject(response.toString());
    }

    /** Load Main.fxml và giữ nguyên hoặc set lại kích thước Stage */
    private void loadMainView(String role) throws IOException {
        Stage currentStage = (Stage) usernameField.getScene().getWindow();
        FXMLLoader loader;
        String title;

        // Switch role để set tiêu đề hoặc load file fxml khác nếu cần
        switch (role) {
            case "Admin":
                loader = new FXMLLoader(getClass().getResource("/view/pages/DashboardView.fxml"));
                title = "Trang quản trị (Admin)";
                break;
            case "Academic Affairs Office":
                loader = new FXMLLoader(getClass().getResource("/view/pages/DashboardView.fxml"));
                title = "Trang quản trị (Admin)";
                break;
            case "Teacher":
                loader = new FXMLLoader(getClass().getResource("/view/Main.fxml"));
                title = "Trang giảng viên (Teacher)";
                break;
            case "Student":
                loader = new FXMLLoader(getClass().getResource("/view/Main.fxml"));
                title = "Trang sinh viên (Student)";
                break;
            default:
                loader = new FXMLLoader(getClass().getResource("/view/Main.fxml"));
                title = "Hệ thống thi trắc nghiệm";
                break;
        }

        Scene scene = new Scene(loader.load());
        currentStage.setScene(scene);
        currentStage.setTitle(title);

        // Cập nhật kích thước cửa sổ chính
        currentStage.setMinWidth(800);
        currentStage.setMinHeight(600);
        currentStage.setWidth(1000);
        currentStage.setHeight(700);
        currentStage.centerOnScreen();
        currentStage.show();
    }

    /** Hàm static hỗ trợ gọi lại màn hình Login từ nơi khác (ví dụ khi Logout) */
    public static void loadLogin(Stage stage) {
        try {
            FXMLLoader loader = new FXMLLoader(LoginController.class.getResource("/view/login/login.fxml"));
            Scene scene = new Scene(loader.load(), 480, 600);
            stage.setScene(scene);
            stage.setTitle("Exam Collection System - Login");
            stage.setResizable(false);
            stage.centerOnScreen();
            stage.show();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}