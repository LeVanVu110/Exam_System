package com.example.studentapp.controller;

import com.example.studentapp.model.RoomModel;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;

public class ExamDetailController {

    @FXML private Button btnBack;
    @FXML private Label lblDetailRoom;
    @FXML private Label lblDetailTenHP;
    @FXML private Label lblDetailCBCT1;
    // (Thêm các @FXML Label chi tiết khác)

    // 1. Biến để giữ tham chiếu đến "cha" (MainViewController)
    private MainViewController mainController;

    // 2. Hàm để "cha" (MainViewController) truyền chính nó vào
    public void setMainController(MainViewController mainController) {
        this.mainController = mainController;
    }

    // 3. Hàm để "cha" (MainViewController) truyền dữ liệu (RoomModel) vào
    public void initData(RoomModel room) {
        // Đổ dữ liệu từ RoomModel vào các Label
        lblDetailRoom.setText(room.roomProperty().get());
        lblDetailTenHP.setText(room.tenHPProperty().get());
        lblDetailCBCT1.setText(room.cbct1Property().get());
        // (Thêm các label khác...)
    }

    // 4. Hàm xử lý nút quay lại
    @FXML
    void handleBack(ActionEvent event) {
        // "Nhờ" cha chuyển về trang danh sách
        if (mainController != null) {
            mainController.showExamListPage();
        }
    }
}