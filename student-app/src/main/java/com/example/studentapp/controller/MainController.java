package com.example.studentapp.controller;

import com.example.studentapp.model.RoomModel;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Parent;
import javafx.scene.layout.AnchorPane;

import java.io.IOException;
import java.net.URL;
import java.util.ResourceBundle;

public class MainController implements Initializable {

    @FXML
    private AnchorPane mainContentPane;
    @FXML
    private HeaderController headerController;

    private Parent examRoomView;
    private ExamRoomController examRoomController;

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        if (headerController != null) {
            headerController.setMainController(this);
        }

        showExamListPage();
    }

    // Hàm tải trang DANH SÁCH (ExamRoom.fxml) vào <center>
    public void showExamListPage() {
        try {
            if (examRoomView == null) {
                System.out.println("Lần đầu: Đang tải Exam");

                FXMLLoader loader = new FXMLLoader(getClass().getResource("/view/pages/ExamRoom.fxml"));
                examRoomView = loader.load();

                examRoomController = loader.getController();
                examRoomController.setMainController(this);
            } else {
                System.out.println("LẦN SAU: Đang dùng lại ExamRoom.fxml từ cache...");
            }

            // Đặt view vào vị trí <center>
            mainContentPane.getChildren().setAll(examRoomView);

            AnchorPane.setTopAnchor(examRoomView, 0.0);
            AnchorPane.setBottomAnchor(examRoomView, 0.0);
            AnchorPane.setLeftAnchor(examRoomView, 0.0);
            AnchorPane.setRightAnchor(examRoomView, 0.0);
        } catch (IOException e) {
            e.printStackTrace();
            System.err.println("Lỗi: Không thể tải ExamRoom.fxml");
        }
    }

    // Hàm tải trang CHI TIẾT (ExamDetail.fxml) vào <center>
    public void showExamDetailPage(int examSessionId) {
        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/view/pages/ExamDetail.fxml"));
            Parent examDetailView = loader.load();

            // Lấy controller của ExamDetail.fxml
            ExamRoomDetailController controller = loader.getController();
            controller.setMainController(this);
            controller.loadExamDetail(examSessionId);

            // Đặt view vào vị trí <center>
            mainContentPane.getChildren().setAll(examDetailView);

            AnchorPane.setTopAnchor(examDetailView, 0.0);
            AnchorPane.setBottomAnchor(examDetailView, 0.0);
            AnchorPane.setLeftAnchor(examDetailView, 0.0);
            AnchorPane.setRightAnchor(examDetailView, 0.0);
        } catch (IOException e) {
            e.printStackTrace();
            System.err.println("Lỗi: Không thể tải ExamDetail.fxml");
        }
    }
}