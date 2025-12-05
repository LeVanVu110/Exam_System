package com.example.studentapp.controller;

import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.stage.Stage;
import javafx.scene.control.CheckBox;
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
    // ✅ 1. KHAI BÁO CHECKBOX
    @FXML
    private CheckBox rememberCheckBox;

    // ✅ 2. KHAI BÁO BIẾN PREFERENCES VÀ KEYS
    private Preferences prefs;
    private static final String PREF_NODE_NAME = "com/example/studentapp/login";
    private static final String PREF_USER = "username";
    private static final String PREF_PASS = "password";
    private static final String PREF_REMEMBER = "rememberMe";

    // ✅ 3. HÀM INITIALIZE - TẢI DỮ LIỆU ĐÃ LƯU
    @FXML
    public void initialize() {
        prefs = Preferences.userRoot().node(PREF_NODE_NAME);

        // Tải thông tin đã lưu
        String savedUsername = prefs.get(PREF_USER, "");
        boolean savedRemember = prefs.getBoolean(PREF_REMEMBER, false);

        // DEBUG: Kiểm tra dữ liệu đọc được
        System.out.println("DEBUG: initialize() được gọi.");
        System.out.println("DEBUG: Username đã lưu: " + savedUsername);
        System.out.println("DEBUG: Checkbox đã lưu: " + savedRemember);

        // usernameField.setText(savedUsername);
        rememberCheckBox.setSelected(savedRemember);
        passwordField.setText("");

        
    }

    @FXML
    private void handleLogin() {
        String username = usernameField.getText();
        String password = passwordField.getText();

        String requiredDomain = "@gmail.com";

        // Kiểm tra xem username (email) có kết thúc bằng "@gmail.com" không
        if (!username.toLowerCase().endsWith(requiredDomain)) {
            messageLabel.setText("Email phải có đuôi là " + requiredDomain + ".");
            messageLabel.setStyle("-fx-text-fill: red;");
            return; // Dừng hàm, không gửi yêu cầu đăng nhập
        }
        // 1. Kiểm tra trường rỗng (Email)
        if (username.isEmpty()) {
            messageLabel.setText("Vui lòng nhập Email.");
            messageLabel.setStyle("-fx-text-fill: red;");
            return;
        }

        // 2. Kiểm tra trường rỗng (Mật khẩu)
        if (password.isEmpty()) {
            messageLabel.setText("Vui lòng nhập Mật khẩu.");
            messageLabel.setStyle("-fx-text-fill: red;");
            return;
        }

        messageLabel.setText("Đang đăng nhập...");
        messageLabel.setStyle("-fx-text-fill: gray;");

        new Thread(() -> {
            try {
                JSONObject response = sendLoginRequest(username, password);

                Platform.runLater(() -> {
                    try {
                        if (response.has("role")) { // Kiểm tra xem trường 'role' có tồn tại không
                            // ✅ SỬA 2: Lấy role trực tiếp từ phản hồi gốc (response)
                            String role = response.getString("role");
                            if (rememberCheckBox.isSelected()) {
                                prefs.put(PREF_USER, username);
                                prefs.put(PREF_PASS, password); 
                                prefs.putBoolean(PREF_REMEMBER, true);
                            }else {
                            // XÓA (Nếu người dùng bỏ chọn)
                            prefs.remove(PREF_USER);
                            prefs.remove(PREF_PASS);
                            prefs.putBoolean(PREF_REMEMBER, false);
                            System.out.println("DEBUG: Đã xóa thông tin đăng nhập.");
                        }
                            loadMainView(role);

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
                Platform.runLater(() -> {
                    messageLabel.setText("Không thể kết nối tới server.");
                    messageLabel.setStyle("-fx-text-fill: red;");
                });
            }
        }).start();
    }

    private JSONObject sendLoginRequest(String username, String password) throws IOException {
        URL url = new URL("http://localhost:8000/api/login");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);
        conn.setConnectTimeout(5000);

        JSONObject requestBody = new JSONObject();
        requestBody.put("email", username);
        requestBody.put("password", password);

        try (OutputStream os = conn.getOutputStream()) {
            byte[] input = requestBody.toString().getBytes("utf-8");
            os.write(input, 0, input.length);
        }

        InputStream is;
        int status = conn.getResponseCode();
        if (status >= 200 && status < 300) {
            is = conn.getInputStream();
        } else {
            is = conn.getErrorStream();
            if (is == null)
                throw new IOException("Server trả lỗi " + status);
        }

        StringBuilder response = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(is, "utf-8"))) {
            String line;
            while ((line = br.readLine()) != null)
                response.append(line.trim());
        }

        if (response.length() == 0)
            throw new IOException("Response rỗng, status: " + status);

        return new JSONObject(response.toString());
    }

    /** Load Main.fxml giữ nguyên kích thước Stage hiện tại */
    private void loadMainView(String role) throws IOException {
        Stage currentStage = (Stage) usernameField.getScene().getWindow();
        FXMLLoader loader;
        String title;

        switch (role) {
            case "Admin":
                loader = new FXMLLoader(getClass().getResource("/view/Main.fxml"));
                title = "Trang quản trị";
                break;
            case "Teacher":
                loader = new FXMLLoader(getClass().getResource("/view/Main.fxml"));
                title = "Trang giảng viên";
                break;
            case "Student":
                loader = new FXMLLoader(getClass().getResource("/view/Main.fxml"));
                title = "Trang sinh viên";
                break;
            default:
                loader = new FXMLLoader(getClass().getResource("/view/Main.fxml"));
                title = "Main";
                break;
        }

        Scene scene = new Scene(loader.load());

        currentStage.setScene(scene);
        currentStage.setTitle(title);

        // Set kích thước lớn hơn login
        currentStage.setMinWidth(479);
        currentStage.setMinHeight(599);
        currentStage.setWidth(1000);
        currentStage.setHeight(700);

        currentStage.centerOnScreen();
        currentStage.show();
    }

    /** Load lại login với kích thước 480x600 */
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
