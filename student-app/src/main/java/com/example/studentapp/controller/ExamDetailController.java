package com.example.studentapp.controller;

import com.example.studentapp.model.RoomModel;
import javafx.beans.binding.Bindings;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ListView;

import java.util.List;

public class ExamDetailController {

    @FXML
    private Label lblTitle;
    @FXML
    private Label lblShowGioThi;
    @FXML
    private Button btnBack;
    @FXML
    private Label lblTenHP;
    @FXML
    private Label lblLopHP;
    @FXML
    private Label lblSoTC;
    @FXML
    private Label lblSoSV;
    @FXML
    private Label lblNgayThi;
    @FXML
    private Label lblGioThi;
    @FXML
    private Label lblTGThi;
    @FXML
    private Label lblRoom;
    @FXML
    private Label lblCBCT1;
    @FXML
    private Label lblCBCT2;

    // 1. Biến để giữ tham chiếu đến "cha" (MainViewController)
    private MainController mainController;

    // 2. Hàm để "cha" (MainViewController) truyền chính nó vào
    public void setMainController(MainController mainController) {
        this.mainController = mainController;
    }

    // 3. Hàm để "cha" (MainViewController) truyền dữ liệu (RoomModel) vào
    public void initData(RoomModel room) {
        btnBack.setOnAction(this::handleBack);

        // Đổ dữ liệu từ RoomModel vào các Label
        lblTitle.setText("Chi Tiết Ca Thi Phòng " + room.roomProperty().get());
        lblShowGioThi.setText("Ca Thi: " + room.gioThiProperty().get());
        lblTenHP.setText(room.tenHPProperty().get());
        lblLopHP.setText(room.lopHPProperty().get());
        lblSoTC.setText(room.soTCProperty().get());
        lblSoSV.setText(room.soSVProperty().get());
        lblNgayThi.setText(room.ngayThiProperty().get());
        lblGioThi.setText(room.gioThiProperty().get());
        lblTGThi.setText(room.tgThiProperty().get());
        lblRoom.setText(room.roomProperty().get());
        lblCBCT1.textProperty().bind(Bindings.concat("• ", room.cbct1Property()));
        lblCBCT2.textProperty().bind(Bindings.concat("• ", room.cbct2Property()));

        lblCBCT1.visibleProperty().bind(room.cbct1Property().isNotEmpty());
        lblCBCT2.visibleProperty().bind(room.cbct2Property().isNotEmpty());

        lblCBCT1.managedProperty().bind(lblCBCT1.visibleProperty());
        lblCBCT2.managedProperty().bind(lblCBCT2.visibleProperty());
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