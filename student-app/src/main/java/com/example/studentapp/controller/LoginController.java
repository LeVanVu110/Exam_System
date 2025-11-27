package com.example.studentapp.controller;

import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.stage.Stage;
import org.json.JSONObject;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

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

        new Thread(() -> {
            try {
                JSONObject response = sendLoginRequest(username, password);

                Platform.runLater(() -> {
                    try {
                        if (response.getBoolean("success")) {
                            JSONObject user = response.getJSONObject("user");
                            String role = user.getString("user_role");

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
