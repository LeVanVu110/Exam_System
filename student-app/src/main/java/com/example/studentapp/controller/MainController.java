package com.example.studentapp.controller;

import com.example.studentapp.model.RoomModel;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Parent;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.BorderPane; // (Nếu cần)

import java.io.IOException;
import java.net.URL;
import java.util.ResourceBundle;

public class MainViewController implements Initializable {

    @FXML private AnchorPane mainContentPane;

    @FXML private HeaderController headerController;

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        // Truyền "cha" cho header (để header có thể gọi logout)
        if (headerController != null) {
            headerController.setMainController(this);
        }

        // 1. Tải trang danh sách làm trang mặc định
        showExamListPage();
    }

    /**
     * 2. Hàm tải trang DANH SÁCH (ExamRoom.fxml) vào <center>
     */
    public void showExamListPage() {
        try {
            // Nạp FXML
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/view/pages/ExamRoom.fxml"));
            Parent examRoomView = loader.load();

            // Lấy controller của ExamRoom.fxml
            ExamRoomController controller = loader.getController();

            // *** BƯỚC QUAN TRỌNG NHẤT ***
            // "Đưa bộ đàm" (tham chiếu) của MainViewController cho con
            controller.setMainController(this);

            // Đặt view vào vị trí <center>
            mainContentPane.getChildren().setAll(examRoomView);

        } catch (IOException e) {
            e.printStackTrace();
            System.err.println("Lỗi: Không thể tải ExamRoom.fxml");
        }
    }

    /**
     * 3. Hàm tải trang CHI TIẾT (ExamDetail.fxml) vào <center>
     */
    public void showExamDetailPage(RoomModel room) {
        try {
            // Nạp FXML
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/view/pages/ExamDetail.fxml"));
            Parent examDetailView = loader.load();

            // Lấy controller của ExamDetail.fxml
            ExamDetailController controller = loader.getController();

            // *** BƯỚC QUAN TRỌNG NHẤT ***
            // 1. "Đưa bộ đàm"
            controller.setMainController(this);
            // 2. Truyền dữ liệu (RoomModel)
            controller.initData(room);

            // Đặt view vào vị trí <center>
            mainContentPane.getChildren().setAll(examDetailView);

        } catch (IOException e) {
            e.printStackTrace();
            System.err.println("Lỗi: Không thể tải ExamDetail.fxml");
        }
    }

    /**
     * 4. (Ví dụ) Hàm để Header gọi khi logout
     * HeaderController sẽ gọi: mainController.showLoginPage();
     */
    public void showLoginPage() {
        System.out.println("Đã nhận lệnh Logout! Chuẩn bị chuyển về trang Login...");
    }
}