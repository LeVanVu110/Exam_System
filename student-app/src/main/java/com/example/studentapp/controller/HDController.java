package com.example.studentapp.controller;

import javafx.animation.Animation;
import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.Tooltip;
import javafx.util.Duration;

import java.net.URL;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ResourceBundle;

public class HDController implements Initializable {

    @FXML
    private Label lblDateTime;
    @FXML
    private Label lblNameTeacher;
    @FXML
    private Button btnLogout;
    @FXML
    private Tooltip tooltipName;

    // Định dạng ngày giờ: dd-MM-yyyy HH:mm:ss
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");

    // Tham chiếu đến MainController để điều khiển chuyển trang
    private MainController mainController;

    /**
     * Hàm này cho phép MainController tự "tiêm" chính nó vào HDController
     * để HDController có thể gọi ngược lại các hàm chuyển trang.
     */
    public void setMainController(MainController mainController) {
        this.mainController = mainController;
    }

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        startClock(); // Bắt đầu chạy đồng hồ khi giao diện load xong
    }

    /**
     * Hiển thị tên giáo viên lên Header
     */
    public void setTeacherInfo(String fullName) {
        if (lblNameTeacher != null) {
            lblNameTeacher.setText(fullName);
        }
        if (tooltipName != null) {
            tooltipName.setText(fullName);
        }
    }

    /**
     * Tạo đồng hồ chạy thời gian thực
     */
    private void startClock() {
        Timeline clock = new Timeline(
                new KeyFrame(Duration.ZERO, e -> {
                    LocalDateTime now = LocalDateTime.now();
                    if (lblDateTime != null) {
                        lblDateTime.setText(now.format(formatter));
                    }
                }),
                new KeyFrame(Duration.seconds(1))
        );
        clock.setCycleCount(Animation.INDEFINITE);
        clock.play();
    }

    // ===============================================
    // PHẦN XỬ LÝ SỰ KIỆN (EVENT HANDLERS)
    // ===============================================

    /**
     * Sự kiện khi nhấn nút "Trang chủ" (hoặc nút quay về danh sách phòng thi).
     * Yêu cầu: Trong file FXML (Header hoặc menu), button phải có onAction="#handleShowExamListPage"
     */
    @FXML
    private void handleShowExamListPage(ActionEvent event) {
        if (mainController != null) {
            System.out.println("HDController: Chuyển sang trang Danh sách phòng thi.");
            mainController.showExamListPage(); 
        } else {
            System.err.println("Lỗi: MainController chưa được set trong HDController.");
        }
    }

    /**
     * Sự kiện khi nhấn nút "Kiểm tra Ca thi".
     * Yêu cầu: Trong file FXML, button phải có onAction="#handleShowKiemTraCaThi"
     */
    @FXML
    private void handleShowKiemTraCaThi(ActionEvent event) {
        if (mainController != null) {
            System.out.println("HDController: Chuyển sang trang Kiểm tra ca thi.");
            mainController.showKiemTraCaThiPage(); 
        } else {
            System.err.println("Lỗi: MainController chưa được set trong HDController.");
        }
    }

    /**
     * Sự kiện khi nhấn nút Đăng xuất
     */
    @FXML
    private void handleLogout(ActionEvent event) {
        System.out.println("Nút Đăng xuất được nhấn.");
        // Logic đăng xuất sẽ được thêm vào sau (ví dụ: quay về màn hình Login)
        // if (mainController != null) { mainController.showLogin(); }
    }
}