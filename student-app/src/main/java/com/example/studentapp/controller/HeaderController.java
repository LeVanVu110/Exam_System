package com.example.studentapp.controller;

import javafx.animation.Animation;
import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.event.ActionEvent; // <-- Thêm import
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.fxml.Initializable;
import javafx.scene.control.Tooltip;
import javafx.util.Duration;

import java.net.URL;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ResourceBundle;

public class HeaderController implements Initializable {

    @FXML
    private Label lblDateTime;
    @FXML
    private Label lblNameTeacher;
    @FXML
    private Button btnLogout;
    @FXML
    private Tooltip tooltipName;

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");

    private MainController mainController;

    public void setMainController(MainController mainController) {
        this.mainController = mainController;
    }

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        startClock();
    }

    public void setTeacherInfo(String fullName) {
        lblNameTeacher.setText(fullName);
        tooltipName.setText(fullName);
    }

    private void startClock() {
        Timeline clock = new Timeline(
                new KeyFrame(Duration.ZERO, e -> {
                    LocalDateTime now = LocalDateTime.now();
                    lblDateTime.setText(now.format(formatter));
                }), new KeyFrame(Duration.seconds(1))
        );
        clock.setCycleCount(Animation.INDEFINITE);
        clock.play();
    }

    // ===============================================
    // PHẦN THÊM MỚI CHO ĐIỀU HƯỚNG (NAVIGATION)
    // ===============================================

    /**
     * Hàm này được gọi khi nhấn nút "Trang chủ" (hoặc nút quay về danh sách phòng).
     * Cần liên kết onAction="#handleShowExamListPage" trong Header.fxml
     */
    @FXML
    private void handleShowExamListPage(ActionEvent event) {
        if (mainController != null) {
            mainController.showExamListPage(); // Gọi hàm trong MainController
        } else {
            System.err.println("Lỗi: MainController chưa được tiêm (inject).");
        }
    }

    /**
     * Hàm này được gọi khi nhấn nút "Kiểm tra Ca thi".
     * Cần liên kết onAction="#handleShowKiemTraCaThi" trong Header.fxml
     */
    @FXML
    private void handleShowKiemTraCaThi(ActionEvent event) {
        if (mainController != null) {
            mainController.showKiemTraCaThiPage(); // Gọi hàm trong MainController
        } else {
            System.err.println("Lỗi: MainController chưa được tiêm (inject).");
        }
    }
    
    // (Bạn có thể thêm hàm xử lý cho btnLogout ở đây)
    @FXML
    private void handleLogout(ActionEvent event) {
        // Xử lý logic đăng xuất (ví dụ: quay về màn hình Login)
        System.out.println("Nút Đăng xuất được nhấn.");
        // mainController.showLoginPage(); // (Ví dụ)
    }
}