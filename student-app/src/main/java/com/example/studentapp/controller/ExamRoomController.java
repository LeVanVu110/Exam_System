package com.example.studentapp.controller;

import com.example.studentapp.model.ApiResponse;
import com.example.studentapp.model.ExamSession;
import com.example.studentapp.model.RoomModel;
import com.example.studentapp.service.ApiServiceTuan; // 1. Sửa import Service mới

import javafx.application.Platform;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.*;
import javafx.scene.layout.VBox;
import javafx.scene.layout.AnchorPane;

import java.net.URL;
import java.time.LocalDate;
import java.util.List;
import java.util.ResourceBundle;

public class ExamRoomController implements Initializable {

    @FXML private TextField txtRoom;
    @FXML private Button btnRoom;
    @FXML private Label lblShowRoom;
    @FXML private VBox vbox;

    // 2. Đổi sang dùng ApiServiceTuan
    private final ApiServiceTuan apiService = new ApiServiceTuan();
    private MainController mainController;

    public void setMainController(MainController mainController) {
        this.mainController = mainController;
    }

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        btnRoom.setOnAction(this::handleSearch);
        txtRoom.setOnAction(this::handleSearch);
        loadInitialData();
    }

    private void loadInitialData() {
        vbox.getChildren().clear();

        // 3. Sửa hàm gọi API: fetchAllExamsForToday()
        apiService.fetchAllExamsForToday().thenAccept(response -> {
            // ApiResponse không có getDate(), ta dùng ngày hiện tại của hệ thống
            LocalDate date = LocalDate.now();
            int day = date.getDayOfMonth();
            int month = date.getMonthValue();

            // Lấy danh sách ExamSession từ response
            List<ExamSession> dataList = response.getData();

            Platform.runLater(() -> updateUiWithResponse(dataList, "ngày " + day + "/" + month));
        }).exceptionally(e -> {
            Platform.runLater(() -> showError("Lỗi tải dữ liệu ban đầu: " + e.getMessage()));
            return null;
        });
    }

    @FXML
    private void handleSearch(ActionEvent event) {
        String roomName = txtRoom.getText();

        if (roomName == null || roomName.trim().isEmpty()) {
            loadInitialData();
            return;
        }

        vbox.getChildren().clear();
        lblShowRoom.setText("Đang tìm phòng " + roomName.toUpperCase() + "...");

        // 4. Sửa hàm tìm kiếm: fetchExamsByRoomForToday
        apiService.fetchExamsByRoomForToday(roomName.trim()).thenAccept(response -> {
            List<ExamSession> dataList = response.getData();
            Platform.runLater(() -> updateUiWithResponse(dataList, "phòng " + roomName.trim().toUpperCase()));
        }).exceptionally(e -> {
            Platform.runLater(() -> showError("Lỗi khi tìm phòng: " + e.getMessage()));
            return null;
        });
    }

    // 5. Sửa tham số đầu vào thành List<ExamSession>
    private void updateUiWithResponse(List<ExamSession> sessionList, String context) {
        try {
            if (sessionList == null || sessionList.isEmpty()) {
                lblShowRoom.setText("Không có ca thi!");
                return;
            }

            lblShowRoom.setText("Các ca thi " + context);
            for (ExamSession session : sessionList) {
                // Chuyển đổi dữ liệu từ Backend (ExamSession) -> Giao diện (RoomModel)
                RoomModel roomModel = convertToRoomModel(session);
                AnchorPane itemPane = createRoomExams(roomModel);
                vbox.getChildren().add(itemPane);
            }

        } catch (Exception e) {
            showError("Lỗi hiển thị dữ liệu: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // 6. Hàm mới: Chuyển đổi ExamSession sang RoomModel
    private RoomModel convertToRoomModel(ExamSession session) {
        RoomModel room = new RoomModel();

        // Với các trường có setter (không bị đỏ), giữ nguyên:
        room.setRoom(session.getPhongThi());
        room.setLopHP(session.getLopSV());
        room.setTenHP(session.getTenHP());
        room.setNgayThi(session.getNgayThi());
        room.setGioThi(session.getGioThi());

        // --- SỬA CÁC DÒNG BỊ LỖI ĐỎ Ở ĐÂY ---
        // Thay vì dùng .setSoSV(), ta dùng .soSVProperty().set()
        
        // Set Số sinh viên
        if (session.getSoSV() != null) {
            room.soSVProperty().set(session.getSoSV());
        }

        // Set Cán bộ coi thi 1
        if (session.getCanBoCoiThi() != null) {
            room.cbct1Property().set(session.getCanBoCoiThi());
        }

        // Các trường giả định (API chưa trả về hoặc mặc định)
        room.khoaCoiThiProperty().set("CNTT");
        room.cbct2Property().set("");       // Set rỗng cho CBCT2
        room.soTCProperty().set("3");       // Set mặc định số tín chỉ
        room.tgThiProperty().set("60p");    // Set mặc định thời gian thi

        // QUAN TRỌNG: Nếu RoomModel của bạn chưa có ID, hãy cẩn thận khi truyền sang trang chi tiết
        // Nếu RoomModel có trường ID, hãy mở comment dòng dưới:
        // room.idProperty().set(session.getMaCaThi()); 

        return room;
    }

    private void showError(String message) {
        System.out.println(message);
        lblShowRoom.setText(message);
    }

    private AnchorPane createRoomExams(RoomModel room) {
        // ... (Giữ nguyên phần tạo giao diện labelPhong, lblRoom, etc.) ...
        AnchorPane pane = new AnchorPane();
        pane.setPrefHeight(140.0);
        pane.setPrefWidth(760.0);
        pane.setStyle("-fx-background-color: #f4f4f4; -fx-background-radius: 8; -fx-border-color: #ddd; -fx-border-radius: 8; -fx-padding: 10;");

        // --- CỘT 1 ---
        double col1X_Title = 20.0; double col1X_Data = 110.0; double col1Y = 10.0; double col2Y = 40.0; double col3Y = 70.0; double col4Y = 100.0;

        Label labelPhong = new Label("Phòng thi:"); labelPhong.setLayoutX(col1X_Title); labelPhong.setLayoutY(col1Y); labelPhong.setStyle("-fx-font-weight: bold;");
        Label lblRoom = new Label(); lblRoom.setLayoutX(col1X_Data); lblRoom.setLayoutY(col1Y); lblRoom.setStyle("-fx-font-weight: bold; -fx-text-fill: #D32F2F;");
        lblRoom.textProperty().bind(room.roomProperty());

        Label labelLopHP = new Label("Lớp HP:"); labelLopHP.setLayoutX(col1X_Title); labelLopHP.setLayoutY(col2Y);
        Label lblClass = new Label(); lblClass.setLayoutX(col1X_Data); lblClass.setLayoutY(col2Y); lblClass.textProperty().bind(room.lopHPProperty());

        Label labelTenHP = new Label("Tên Học Phần:"); labelTenHP.setLayoutX(col1X_Title); labelTenHP.setLayoutY(col3Y);
        Label lblName = new Label(); lblName.setLayoutX(col1X_Data); lblName.setLayoutY(col3Y); lblName.textProperty().bind(room.tenHPProperty());
        lblName.setPrefWidth(230.0); lblName.setTextOverrun(OverrunStyle.ELLIPSIS);
        Tooltip nameTooltip = new Tooltip(); nameTooltip.textProperty().bind(room.tenHPProperty()); lblName.setTooltip(nameTooltip);

        Label labelKhoa = new Label("Khoa coi thi:"); labelKhoa.setLayoutX(col1X_Title); labelKhoa.setLayoutY(col4Y);
        Label lblKhoa = new Label(); lblKhoa.setLayoutX(col1X_Data); lblKhoa.setLayoutY(col4Y); lblKhoa.textProperty().bind(room.khoaCoiThiProperty());

        // --- CỘT 2 ---
        double col2X_Title = 350.0; double col2X_Data = 420.0;
        Label labelNgayThi = new Label("Ngày thi:"); labelNgayThi.setLayoutX(col2X_Title); labelNgayThi.setLayoutY(col1Y);
        Label lblDate = new Label(); lblDate.setLayoutX(col2X_Data); lblDate.setLayoutY(col1Y); lblDate.textProperty().bind(room.ngayThiProperty());

        Label labelGioThi = new Label("Giờ thi:"); labelGioThi.setLayoutX(col2X_Title); labelGioThi.setLayoutY(col2Y);
        Label lblTime = new Label(); lblTime.setLayoutX(col2X_Data); lblTime.setLayoutY(col2Y); lblTime.textProperty().bind(room.gioThiProperty());

        Label labelCbct1 = new Label("CBCT 1:"); labelCbct1.setLayoutX(col2X_Title); labelCbct1.setLayoutY(col3Y);
        Label lblCbct1 = new Label(); lblCbct1.setLayoutX(col2X_Data); lblCbct1.setLayoutY(col3Y); lblCbct1.textProperty().bind(room.cbct1Property());

        Label labelCbct2 = new Label("CBCT 2:"); labelCbct2.setLayoutX(col2X_Title); labelCbct2.setLayoutY(col4Y);
        Label lblCbct2 = new Label(); lblCbct2.setLayoutX(col2X_Data); lblCbct2.setLayoutY(col4Y); lblCbct2.textProperty().bind(room.cbct2Property());

        // --- CỘT 3 ---
        double col3X_Title = 630.0; double col3X_Data = 690.0;
        Label labelSoSV = new Label("Số SV:"); labelSoSV.setLayoutX(col3X_Title); labelSoSV.setLayoutY(col2Y);
        Label lblSoSV = new Label(); lblSoSV.setLayoutX(col3X_Data); lblSoSV.setLayoutY(col2Y); lblSoSV.textProperty().bind(room.soSVProperty());

        Label labelSoTC = new Label("Số TC:"); labelSoTC.setLayoutX(col3X_Title); labelSoTC.setLayoutY(col3Y);
        Label lblSoTC = new Label(); lblSoTC.setLayoutX(col3X_Data); lblSoTC.setLayoutY(col3Y); lblSoTC.textProperty().bind(room.soTCProperty());

        Label labelTgThi = new Label("TG Thi:"); labelTgThi.setLayoutX(col3X_Title); labelTgThi.setLayoutY(col4Y);
        Label lblTgThi = new Label(); lblTgThi.setLayoutX(col3X_Data); lblTgThi.setLayoutY(col4Y); lblTgThi.textProperty().bind(room.tgThiProperty());

        pane.getChildren().addAll(labelPhong, lblRoom, labelLopHP, lblClass, labelTenHP, lblName, labelKhoa, lblKhoa,
                labelNgayThi, lblDate, labelGioThi, lblTime, labelCbct1, lblCbct1, labelCbct2, lblCbct2,
                labelSoSV, lblSoSV, labelSoTC, lblSoTC, labelTgThi, lblTgThi);

        // 7. Sửa lỗi getId(): Truyền thẳng đối tượng room sang MainController
        pane.setOnMouseClicked(event -> {
            if (mainController != null) {
                // Thay vì gọi room.getId(), ta truyền nguyên đối tượng room
                // MainController.showExamDetailPage(RoomModel room) đã hỗ trợ việc này
                mainController.showExamDetailPage(room);
            } else {
                System.err.println("Lỗi: MainController chưa được set cho ExamRoomController.");
            }
        });

        pane.setOnMouseEntered(e -> pane.setStyle(pane.getStyle() + "-fx-border-color: #0078D4; -fx-cursor: hand;"));
        pane.setOnMouseExited(e -> pane.setStyle(pane.getStyle().replace("-fx-border-color: #0078D4; -fx-cursor: hand;", "")));
        return pane;
    }
}