package com.example.studentapp.controller;

import com.example.studentapp.service.ApiService;
import com.example.studentapp.model.ApiResponse;
import com.example.studentapp.model.RoomModel;
import javafx.application.Platform;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.layout.VBox;
import javafx.scene.layout.AnchorPane;

import java.net.URL;
import java.util.List;
import java.util.ResourceBundle;

public class ExamRoomController implements Initializable {

    @FXML
    private TextField txtRoom;
    @FXML
    private Button btnRoom;
    @FXML
    private Label lblShowRoom;
    @FXML
    private VBox vbox;

    private final ApiService apiService = new ApiService();

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        btnRoom.setOnAction(this::handleSearch);
        txtRoom.setOnAction(this::handleSearch);
        loadInitialData();
    }

    private void loadInitialData() {
        lblShowRoom.setText("Đang tải tất cả lịch thi...");
        vbox.getChildren().clear();

        apiService.fetchAllExams().thenAccept(response -> {
            Platform.runLater(() -> updateUiWithResponse(response, "tất cả"));
        }).exceptionally(e -> {
            Platform.runLater(() -> showError("Lỗi tải dữ liệu ban đầu: " + e.getMessage()));
            return null;
        });
    }

    private void updateUiWithResponse(ApiResponse response, String context) {
        try {
            List<RoomModel> roomList = response.getData();
            int countRoom = response.getCount();

            if (roomList == null || roomList.isEmpty()) {
                lblShowRoom.setText("Không có phòng " + context.toUpperCase());
                return;
            }

            lblShowRoom.setText("Có " + countRoom + " ca thi cho " + context.toUpperCase());

            for (RoomModel room : roomList) {
                AnchorPane itemPane = createRoomExams(room);
                vbox.getChildren().add(itemPane);
            }
        } catch (Exception e) {
            showError("Lỗi hiễn thị dữ liệu: " + e.getMessage());
        }
    }

    private void showError(String message) {
        System.out.println(message);
        lblShowRoom.setText(message);
    }

    @FXML
    private void handleSearch(ActionEvent event) {
        String roomName = txtRoom.getText();

        // Nếu ô tìm kiếm trống, ta tải lại toàn bộ dữ liệu
        if (roomName == null || roomName.trim().isEmpty()) {
            loadInitialData(); //
            return;
        }

        // Nếu có nhập, thì tìm kiếm
        vbox.getChildren().clear();
        lblShowRoom.setText("Đang tìm phòng " + roomName.toUpperCase() + "...");

        apiService.fetchExamsByRoom(roomName.trim()).thenAccept(response -> {
            Platform.runLater(() -> updateUiWithResponse(response, roomName.trim()));
        }).exceptionally(e -> {
            Platform.runLater(() -> showError("Lỗi khi tìm phòng: " + e.getMessage()));
            return null;
        });
    }

    private AnchorPane createRoomExams(RoomModel room) {
        // Tạo AnchorPane cha
        AnchorPane pane = new AnchorPane();
        pane.setPrefHeight(75.0);
        pane.setPrefWidth(760.0); // Kích thước này nên khớp với VBox
        pane.setStyle("-fx-background-color: #f4f4f4; -fx-background-radius: 8; -fx-border-color: #ddd; -fx-border-radius: 8;");

        // --- Tạo các Label tĩnh (tiêu đề) ---
        Label labelPhong = new Label("Phòng: ");
        labelPhong.setLayoutX(20.0);
        labelPhong.setLayoutY(10.0);
        labelPhong.setStyle("-fx-font-weight: bold;");

        Label labelLopHP = new Label("Lớp HP:");
        labelLopHP.setLayoutX(20.0);
        labelLopHP.setLayoutY(40.0);

        Label labelTenHP = new Label("Tên Học Phần:");
        labelTenHP.setLayoutX(200.0);
        labelTenHP.setLayoutY(10.0);

        Label labelGioThi = new Label("Giờ thi:");
        labelGioThi.setLayoutX(200.0);
        labelGioThi.setLayoutY(40.0);

        Label labelNgayThi = new Label("Ngày thi:");
        labelNgayThi.setLayoutX(400.0);
        labelNgayThi.setLayoutY(40.0);

        // --- Tạo các Label động (dữ liệu) ---

        // Label cho Phòng (dùng property `roomProperty` từ model)
        Label lblRoom = new Label();
        lblRoom.setLayoutX(63.0);
        lblRoom.setLayoutY(10.0);
        lblRoom.setStyle("-fx-font-weight: bold;");
        lblRoom.textProperty().bind(room.roomProperty()); // Binding dữ liệu

        // Label cho Lớp HP
        Label lblClass = new Label();
        lblClass.setLayoutX(63.0);
        lblClass.setLayoutY(40.0);
        lblClass.textProperty().bind(room.lopHPProperty()); // Binding dữ liệu

        // Label cho Tên HP
        Label lblName = new Label();
        lblName.setLayoutX(285.0);
        lblName.setLayoutY(10.0);
        lblName.textProperty().bind(room.tenHPProperty()); // Binding dữ liệu

        // Label cho Giờ thi
        Label lblTime = new Label();
        lblTime.setLayoutX(246.0);
        lblTime.setLayoutY(40.0);
        lblTime.textProperty().bind(room.gioThiProperty()); // Binding dữ liệu

        // Label cho Ngày thi
        Label lblDate = new Label();
        lblDate.setLayoutX(454.0);
        lblDate.setLayoutY(40.0);
        lblDate.textProperty().bind(room.ngayThiProperty()); // Binding dữ liệu

        // Thêm tất cả các Label vào AnchorPane
        pane.getChildren().addAll(labelPhong, labelLopHP, labelTenHP, labelGioThi, labelNgayThi, lblRoom, lblClass, lblName, lblTime, lblDate);

        return pane;
    }
}
