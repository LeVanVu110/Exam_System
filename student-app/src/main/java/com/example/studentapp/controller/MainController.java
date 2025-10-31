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
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/view/pages/ExamRoom.fxml"));
            Parent examRoomView = loader.load();

            // Lấy controller của ExamRoom.fxml
            ExamRoomController controller = loader.getController();
            controller.setMainController(this);

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
    public void showExamDetailPage(RoomModel room) {
        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/view/pages/ExamDetail.fxml"));
            Parent examDetailView = loader.load();

            // Lấy controller của ExamDetail.fxml
            ExamRoomDetailController controller = loader.getController();
            controller.setMainController(this);
            controller.initData(room);

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