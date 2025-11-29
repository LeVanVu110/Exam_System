package com.example.studentapp.controller;

import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.layout.StackPane;
import java.io.IOException;

public class DashboardController {

    @FXML private StackPane contentArea;

    @FXML
    public void showTongHop() {
        loadView("/view/pages/TongHopQuanLiView.fxml");
    }

    @FXML
    public void showLichThi() {
        loadView("/view/pages/LichThiView.fxml");
    }

    @FXML
    public void showKiemTra() {
        loadView("/view/pages/KiemTraCaThi.fxml");
    }

    @FXML
    public void showThongKe() {
        loadView("/view/pages/ThongKeView.fxml");
    }

    private void loadView(String fxmlPath) {
        try {
            // Xóa nội dung cũ
            contentArea.getChildren().clear();
            
            // Tải file FXML mới
            FXMLLoader loader = new FXMLLoader(getClass().getResource(fxmlPath));
            Parent view = loader.load();
            
            // Thêm vào vùng giữa màn hình
            contentArea.getChildren().add(view);
            
        } catch (IOException e) {
            e.printStackTrace();
            System.err.println("Không tìm thấy file FXML: " + fxmlPath);
        }
    }
}