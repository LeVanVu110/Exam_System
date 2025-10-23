package com.example.studentapp.controller;

import com.example.studentapp.model.ExamStatus;
import com.example.studentapp.service.ApiService;
import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.stage.Stage;
import javafx.util.Duration;

import java.io.IOException;

public class WaitingRoomController {

    @FXML
    private Label statusLabel; // Label để hiển thị trạng thái, khớp với fx:id

    private Timeline statusChecker;
    // ID này cần khớp với ID bạn đặt trong Mockoon để test
    private final String currentExamId = "123"; 

    @FXML
    public void initialize() {
        statusLabel.setText("Đang chờ lệnh bắt đầu từ phòng đào tạo...");
        startPollingForExamStatus();
    }

    private void startPollingForExamStatus() {
        // Tạo một vòng lặp để kiểm tra trạng thái mỗi 5 giây
        statusChecker = new Timeline(
            new KeyFrame(Duration.seconds(5), event -> {
                new Thread(() -> {
                    // Gọi service để lấy trạng thái từ API giả
                    ExamStatus examStatus = ApiService.getExamStatus(currentExamId);

                    // Nếu nhận được trạng thái là "STARTED"
                    if (examStatus != null && "STARTED".equals(examStatus.getStatus())) {
                        // Cập nhật giao diện trên luồng chính của JavaFX
                        Platform.runLater(() -> {
                            statusChecker.stop(); // Dừng kiểm tra
                            statusLabel.setText("Kỳ thi đã bắt đầu!");
                            switchToExamScreen(); // Chuyển màn hình
                        });
                    }
                }).start();
            })
        );

        statusChecker.setCycleCount(Timeline.INDEFINITE); // Lặp vô hạn
        statusChecker.play(); // Bắt đầu
    }

    // Hàm để chuyển sang màn hình làm bài
    private void switchToExamScreen() {
        try {
            // Thay "UploadView.fxml" bằng tên file FXML màn hình làm bài của bạn
            Parent examView = FXMLLoader.load(getClass().getResource("/com/example/studentapp/upload-view.fxml")); 
            Stage stage = (Stage) statusLabel.getScene().getWindow();
            stage.setScene(new Scene(examView));
            stage.setTitle("Màn hình làm bài");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}