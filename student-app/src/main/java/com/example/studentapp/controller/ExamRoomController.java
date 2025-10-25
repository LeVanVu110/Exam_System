package com.example.studentapp.controller;

import com.example.studentapp.Main;
import com.example.studentapp.service.ApiService;
import com.example.studentapp.model.ApiResponse;
import com.example.studentapp.model.RoomModel;
import javafx.application.Platform;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.*;
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

    private MainViewController mainController;

    public void setMainController(MainViewController mainController) {
        this.mainController = mainController;
    }

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

    private AnchorPane createRoomExams(RoomModel room)  {
        // Tăng chiều cao để chứa thêm thông tin
        AnchorPane pane = new AnchorPane();
        pane.setPrefHeight(140.0);
        pane.setPrefWidth(760.0);
        pane.setStyle("-fx-background-color: #f4f4f4; -fx-background-radius: 8; -fx-border-color: #ddd; -fx-border-radius: 8; -fx-padding: 10;");

        // --- CỘT 1 (Thông tin Lớp/Phòng) ---
        double col1X_Title = 20.0;
        double col1X_Data = 110.0;
        double col1_DataWidth = 230.0;
        double col1Y = 10.0;
        double col2Y = 40.0;
        double col3Y = 70.0;
        double col4Y = 100.0;

        // Phòng
        Label labelPhong = new Label("Phòng thi:");
        labelPhong.setLayoutX(col1X_Title);
        labelPhong.setLayoutY(col1Y);
        labelPhong.setStyle("-fx-font-weight: bold;");

        Label lblRoom = new Label();
        lblRoom.setLayoutX(col1X_Data);
        lblRoom.setLayoutY(col1Y);
        lblRoom.setStyle("-fx-font-weight: bold; -fx-text-fill: #D32F2F;"); // Tô đậm màu đỏ
        lblRoom.textProperty().bind(room.roomProperty());

        // Lớp HP
        Label labelLopHP = new Label("Lớp HP:");
        labelLopHP.setLayoutX(col1X_Title);
        labelLopHP.setLayoutY(col2Y);

        Label lblClass = new Label();
        lblClass.setLayoutX(col1X_Data);
        lblClass.setLayoutY(col2Y);
        lblClass.textProperty().bind(room.lopHPProperty());

        // Tên HP
        Label labelTenHP = new Label("Tên Học Phần:");
        labelTenHP.setLayoutX(col1X_Title);
        labelTenHP.setLayoutY(col3Y);

        Label lblName = new Label();
        lblName.setLayoutX(col1X_Data);
        lblName.setLayoutY(col3Y);
        lblName.textProperty().bind(room.tenHPProperty());

        lblName.setPrefWidth(col1_DataWidth);
        lblName.setTextOverrun(OverrunStyle.ELLIPSIS);
        Tooltip nameTooltip = new Tooltip();
        nameTooltip.textProperty().bind(room.tenHPProperty());
        lblName.setTooltip(nameTooltip);

        // Khoa
        Label labelKhoa = new Label("Khoa coi thi:");
        labelKhoa.setLayoutX(col1X_Title);
        labelKhoa.setLayoutY(col4Y);

        Label lblKhoa = new Label();
        lblKhoa.setLayoutX(col1X_Data);
        lblKhoa.setLayoutY(col4Y);
        lblKhoa.textProperty().bind(room.khoaCoiThiProperty());


        // --- CỘT 2 (Thời gian & Giám thị) ---
        double col2X_Title = 350.0;
        double col2X_Data = 420.0;

        // Ngày thi
        Label labelNgayThi = new Label("Ngày thi:");
        labelNgayThi.setLayoutX(col2X_Title);
        labelNgayThi.setLayoutY(col1Y);

        Label lblDate = new Label();
        lblDate.setLayoutX(col2X_Data);
        lblDate.setLayoutY(col1Y);
        lblDate.textProperty().bind(room.ngayThiProperty());

        // Giờ thi
        Label labelGioThi = new Label("Giờ thi:");
        labelGioThi.setLayoutX(col2X_Title);
        labelGioThi.setLayoutY(col2Y);

        Label lblTime = new Label();
        lblTime.setLayoutX(col2X_Data);
        lblTime.setLayoutY(col2Y);
        lblTime.textProperty().bind(room.gioThiProperty());

        // CBCT 1
        Label labelCbct1 = new Label("CBCT 1:");
        labelCbct1.setLayoutX(col2X_Title);
        labelCbct1.setLayoutY(col3Y);

        Label lblCbct1 = new Label();
        lblCbct1.setLayoutX(col2X_Data);
        lblCbct1.setLayoutY(col3Y);
        lblCbct1.textProperty().bind(room.cbct1Property());

        // CBCT 2
        Label labelCbct2 = new Label("CBCT 2:");
        labelCbct2.setLayoutX(col2X_Title);
        labelCbct2.setLayoutY(col4Y);

        Label lblCbct2 = new Label();
        lblCbct2.setLayoutX(col2X_Data);
        lblCbct2.setLayoutY(col4Y);
        lblCbct2.textProperty().bind(room.cbct2Property());


        // --- CỘT 3 (Thông số) ---
        double col3X_Title = 630.0;
        double col3X_Data = 690.0;

        // STT
        Label labelSTT = new Label("STT:");
        labelSTT.setLayoutX(col3X_Title);
        labelSTT.setLayoutY(col1Y);

        Label lblSTT = new Label();
        lblSTT.setLayoutX(col3X_Data);
        lblSTT.setLayoutY(col1Y);
        lblSTT.textProperty().bind(room.sttProperty());

        // Số SV
        Label labelSoSV = new Label("Số SV:");
        labelSoSV.setLayoutX(col3X_Title);
        labelSoSV.setLayoutY(col2Y);

        Label lblSoSV = new Label();
        lblSoSV.setLayoutX(col3X_Data);
        lblSoSV.setLayoutY(col2Y);
        lblSoSV.textProperty().bind(room.soSVProperty());

        // Số TC
        Label labelSoTC = new Label("Số TC:");
        labelSoTC.setLayoutX(col3X_Title);
        labelSoTC.setLayoutY(col3Y);

        Label lblSoTC = new Label();
        lblSoTC.setLayoutX(col3X_Data);
        lblSoTC.setLayoutY(col3Y);
        lblSoTC.textProperty().bind(room.soTCProperty());

        // TG Thi
        Label labelTgThi = new Label("TG Thi:");
        labelTgThi.setLayoutX(col3X_Title);
        labelTgThi.setLayoutY(col4Y);

        Label lblTgThi = new Label();
        lblTgThi.setLayoutX(col3X_Data);
        lblTgThi.setLayoutY(col4Y);
        lblTgThi.textProperty().bind(room.tgThiProperty());

        // Thêm tất cả các Label vào AnchorPane
        pane.getChildren().addAll(
                labelPhong, lblRoom, labelLopHP, lblClass, labelTenHP, lblName, labelKhoa, lblKhoa,
                labelNgayThi, lblDate, labelGioThi, lblTime, labelCbct1, lblCbct1, labelCbct2, lblCbct2,
                labelSTT, lblSTT, labelSoSV, lblSoSV, labelSoTC, lblSoTC, labelTgThi, lblTgThi
        );

        pane.setOnMouseClicked(event -> {
            // Kiểm tra xem "cha" (mainController) có tồn tại không
            if (mainController != null) {
                // "Nhờ" cha chuyển sang trang chi tiết và gửi dữ liệu "room"
                mainController.showExamDetailPage(room);
            } else {
                System.err.println("Lỗi: MainController chưa được set cho ExamRoomController.");
            }
        });

        // (Tùy chọn) Thêm hiệu ứng hover
        pane.setOnMouseEntered(e -> {
            pane.setStyle(pane.getStyle() + "-fx-border-color: #0078D4; -fx-cursor: hand;");
        });
        pane.setOnMouseExited(e -> {
            pane.setStyle(pane.getStyle().replace("-fx-border-color: #0078D4; -fx-cursor: hand;", ""));
        });
        return pane;
    }
}
