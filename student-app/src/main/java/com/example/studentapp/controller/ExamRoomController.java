package com.example.studentapp.controller;

import com.example.studentapp.model.ApiResponse;
import com.example.studentapp.model.RoomModel;
import com.fasterxml.jackson.core.type.TypeReference; // Cần thiết để parse List
import com.fasterxml.jackson.databind.ObjectMapper;
import javafx.application.Platform;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.layout.VBox;
import javafx.scene.layout.AnchorPane;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

public class RoomController {

    @FXML private TextField txtRoom;
    @FXML private Button btnRoom;
    @FXML private Label lblShowRoom;
    @FXML private VBox vbox;
    @FXML private HeaderController headerController;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @FXML
    public void initialize() {
        // Gán sự kiện click cho button
        String teacherNameFromLogin = "Đặng Thị Thu Hoài Rất Rất Dài";
        headerController.setTeacherInfo(teacherNameFromLogin);
        btnRoom.setOnAction(this::handleSubmitButton);
    }

    private void handleSubmitButton(ActionEvent event) {
        String roomName = txtRoom.getText();
        if (roomName == null || roomName.trim().isEmpty()) {
            lblShowRoom.setText("Vui lòng nhập số phòng");
            return;
        }

        lblShowRoom.setText("Đang tải dữ liệu cho phòng: " + roomName.toUpperCase());
        vbox.getChildren().clear();
        fetchExamScheduleForRoom(roomName);
    }

    private void fetchExamScheduleForRoom(String roomName) {
        String apiUri = "http://localhost:8000/api/exams?room=" + roomName.trim();

        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(apiUri)).GET().build();

        httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString()).thenApply(HttpResponse::body).thenAccept(this::processApiResponse).exceptionally(e -> {
            Platform.runLater(() -> {
                lblShowRoom.setText("Lỗi khi gọi API" + e.getMessage());
            });
            return null;
        });
    }

    //    Xử lý chuổi JSON nhận về từ API
    private void processApiResponse(String jsonBody) {

        try {

            ApiResponse response = objectMapper.readValue(jsonBody, ApiResponse.class);
            List<RoomModel> roomList = response.getData();


            Platform.runLater(() -> {
                if (roomList.isEmpty()) {
                    lblShowRoom.setText("Không tìm thấy lịch thi cho phòng: " + txtRoom.getText().toUpperCase());
                    return;
                }
                lblShowRoom.setText("Kết quả cho phòng: " + txtRoom.getText().toUpperCase());

                // Lặp qua danh sách kết quả
                for (RoomModel room : roomList) {
                    // Tạo một AnchorPane mới cho mỗi lịch thi
                    AnchorPane itemPane = createRoomExams(room);
                    // Thêm Pane đó vào VBox
                    vbox.getChildren().add(itemPane);
                }
            });
        } catch (Exception e) {
            e.printStackTrace();

            Platform.runLater(() -> {
                lblShowRoom.setText("Lỗi: Không thể đọc dữ liệu (JSON) trả về");
            });
        }
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
