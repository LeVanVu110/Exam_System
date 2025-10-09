package com.example.studentapp.controller;

import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.stage.Stage;

import java.io.IOException;

public class LoginController {

    @FXML private TextField usernameField;
    @FXML private PasswordField passwordField;
    @FXML private Label messageLabel;

    @FXML
    private void handleLogin() {
        String username = usernameField.getText();
        String password = passwordField.getText();

        // ⚠️ LOGIC XÁC THỰC ĐƠN GIẢN (Cần thay thế bằng gọi API thực tế)
        if ("student".equals(username) && "123456".equals(password)) {
            messageLabel.setText("Đăng nhập thành công!");
            messageLabel.setStyle("-fx-text-fill: green;");
            
            // Chuyển sang màn hình chính (ví dụ: màn hình upload)
            loadMainView();
            
        } else {
            messageLabel.setText("Tên đăng nhập hoặc mật khẩu không đúng.");
            messageLabel.setStyle("-fx-text-fill: red;");
        }
    }

    private void loadMainView() {
        try {
            // Lấy Stage hiện tại từ một trong các thành phần UI
            Stage currentStage = (Stage) usernameField.getScene().getWindow();
            
            // Tải FXML của màn hình chính/màn hình tiếp theo (ví dụ: upload-view.fxml)
            FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource("/upload-view.fxml"));
            Scene scene = new Scene(fxmlLoader.load(), 800, 600); // Kích thước mới
            
            currentStage.setTitle("Hệ thống nộp bài thi");
            currentStage.setScene(scene);
            
        } catch (IOException e) {
            e.printStackTrace();
            System.err.println("Không thể tải màn hình chính (upload-view.fxml).");
        }
    }
}