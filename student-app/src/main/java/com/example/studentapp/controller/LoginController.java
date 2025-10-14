package com.example.studentapp;

import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.control.TextField;
import javafx.scene.control.PasswordField;
import javafx.scene.control.Alert;
import java.io.File;
import javafx.stage.Stage;
import java.io.IOException;

public class LoginController {

    @FXML
    private TextField usernameField;
    @FXML
    private PasswordField passwordField;

    // Xử lý khi nhấn nút "Đăng nhập"
    @FXML
    protected void handleLogin() {
        String username = usernameField.getText();
        String password = passwordField.getText();
        if (username.isEmpty() || password.isEmpty()) {
            showAlert("Lỗi đăng nhập", "Vui lòng nhập tài khoản và mật khẩu!");
            return;
        }
        // Giả sử kiểm tra login tạm thời (bạn có thể thay bằng kiểm tra DB)
        if ("student".equals(username) && "123".equals(password)) {
            createExamFolders();
            loadMainView("upload-view.fxml", "Hệ thống nộp bài thi (Sinh viên)");
        } 
        else if ("admin".equals(username) && "123".equals(password)) {
            loadMainView("admin-view.fxml", "Hệ thống quản lý (Admin)");
        }  
        else {
            showAlert("Lỗi đăng nhập", "Sai tài khoản hoặc mật khẩu!");
        }
    }

    private void createExamFolders() {
    // Đường dẫn gốc ở ổ D
    String basePath = "D:/Kiểm Tra";

    // Tạo thư mục gốc "Kiểm Tra"
    File baseDir = new File(basePath);
    if (!baseDir.exists()) {
        baseDir.mkdirs();
    }

    // Tạo các thư mục con "MAY 1" → "MAY 5"
    for (int i = 1; i <= 5; i++) {
        File folder = new File(baseDir, "MAY " + i);
        if (!folder.exists()) {
            folder.mkdirs();
        }
    }

    System.out.println("Đã tạo thư mục ở: " + baseDir.getAbsolutePath());
}


    private void showAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }
    private void loadMainView(String fxmlPath, String title) {
        try {
            Stage currentStage = (Stage) usernameField.getScene().getWindow();

            FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource("/" + fxmlPath));
            Scene scene = new Scene(fxmlLoader.load(), 800, 600);

            currentStage.setTitle(title);
            currentStage.setScene(scene);
        } catch (IOException e) {
            e.printStackTrace();
            System.err.println("Không thể tải file FXML: " + fxmlPath);
        }
    }
}
