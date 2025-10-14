package com.example.studentapp.controller;

import com.example.studentapp.service.ApiService;
import javafx.fxml.FXML;
import javafx.scene.control.*;

public class LoginController {
    @FXML private TextField txtEmail;
    @FXML private PasswordField txtPassword;
    @FXML private Label lblStatus;

    private final ApiService apiService = new ApiService();

    @FXML
    private void handleLogin() {
        String email = txtEmail.getText();
        String password = txtPassword.getText();

        boolean success = apiService.login(email, password);
        if (success) {
            lblStatus.setText("Đăng nhập thành công!");
            // TODO: chuyển sang Dashboard
        } else {
            lblStatus.setText("Sai tài khoản hoặc mật khẩu.");
        }
    }
}
