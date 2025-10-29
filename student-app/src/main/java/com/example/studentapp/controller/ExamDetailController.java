package com.example.studentapp.controller;

import com.example.studentapp.model.RoomModel;
import com.example.studentapp.service.ApiService;
import javafx.application.Platform;
import javafx.beans.binding.Bindings;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.layout.GridPane;
import javafx.util.Pair;

import java.util.Optional;

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
    @FXML
    private Button btnThayDoiCBCT;

    private MainController mainController;
    private RoomModel currentRoom;
    private final ApiService apiService = new ApiService();

    public void setMainController(MainController mainController) {
        this.mainController = mainController;
    }

    public void initData(RoomModel room) {
        this.currentRoom = room;

        btnBack.setOnAction(this::handleBack);
        btnThayDoiCBCT.setOnAction(this::handleShowForm);

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

    @FXML
    void handleShowForm(ActionEvent event) {
        Dialog<Pair<String, String>> dialog = new Dialog<>();
        dialog.setTitle("Thay đổi Cán bộ coi thi");
        dialog.setHeaderText("Nhập tên cán bộ coi thi mới cho phòng " + currentRoom.roomProperty().get());

        // 2. Set các nút
        ButtonType saveButtonType = new ButtonType("Lưu", ButtonBar.ButtonData.OK_DONE);
        dialog.getDialogPane().getButtonTypes().addAll(saveButtonType, ButtonType.CANCEL);

        // 3. Tạo layout cho Form (GridPane)
        GridPane grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(10);
        grid.setPadding(new Insets(20, 150, 10, 10));

        TextField txtCbct1 = new TextField();
        txtCbct1.setPromptText("Tên CBCT 1");
        // Lấy dữ liệu hiện tại gán vào
        txtCbct1.setText(currentRoom.cbct1Property().get());

        TextField txtCbct2 = new TextField();
        txtCbct2.setPromptText("Tên CBCT 2");
        // Lấy dữ liệu hiện tại gán vào
        txtCbct2.setText(currentRoom.cbct2Property().get());

        grid.add(new Label("CBCT 1:"), 0, 0);
        grid.add(txtCbct1, 1, 0);
        grid.add(new Label("CBCT 2:"), 0, 1);
        grid.add(txtCbct2, 1, 1);

        dialog.getDialogPane().setContent(grid);

        // 4. Chuyển đổi kết quả trả về khi nhấn nút
        dialog.setResultConverter(dialogButton -> {
            if (dialogButton == saveButtonType) {
                // Trả về một Pair chứa 2 giá trị mới
                return new Pair<>(txtCbct1.getText(), txtCbct2.getText());
            }
            return null; // Trả về null nếu nhấn Hủy
        });

        // 5. Hiển thị Dialog và chờ kết quả
        Optional<Pair<String, String>> result = dialog.showAndWait();

        // 6. Xử lý kết quả (Nếu người dùng nhấn "Lưu")
        result.ifPresent(newNames -> {
            String newCbct1 = newNames.getKey();
            String newCbct2 = newNames.getValue();

            String examId = currentRoom.sttProperty().get();

            btnThayDoiCBCT.setDisable(true);
            btnThayDoiCBCT.setText("Đang lưu...");

            apiService.updateExamProctors(examId, newCbct1, newCbct2)
                    .thenAccept(success -> {
                        // Khi API báo thành công
                        Platform.runLater(() -> {
                            // === CẬP NHẬT LOCAL MODEL ===
                            // Vì Label đã "bind" với 2 property này,
                            // giao diện sẽ TỰ ĐỘNG cập nhật!
                            currentRoom.cbct1Property().set(newCbct1);
                            currentRoom.cbct2Property().set(newCbct2);

                            // Thông báo thành công
                            Alert alert = new Alert(Alert.AlertType.INFORMATION);
                            alert.setTitle("Thành công");
                            alert.setHeaderText(null);
                            alert.setContentText("Đã cập nhật Cán bộ coi thi thành công.");
                            alert.showAndWait();

                            btnThayDoiCBCT.setDisable(false);
                            btnThayDoiCBCT.setText("Thay đổi CBCT");
                        });
                    })
                    .exceptionally(e -> {
                        // Khi API báo lỗi
                        Platform.runLater(() -> {
                            Alert alert = new Alert(Alert.AlertType.ERROR);
                            alert.setTitle("Lỗi");
                            alert.setHeaderText("Không thể cập nhật");
                            alert.setContentText("Lỗi: " + e.getMessage());
                            alert.showAndWait();

                            btnThayDoiCBCT.setDisable(false);
                            btnThayDoiCBCT.setText("Thay đổi CBCT");
                        });
                        return null;
                    });
        });
    }
}