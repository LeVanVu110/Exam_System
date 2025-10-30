package com.example.studentapp.controller;

import com.example.studentapp.model.ApiResponse;
import com.example.studentapp.model.ExamSession;
import com.example.studentapp.service.ApiService;
import javafx.application.Platform;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.Alert;
import javafx.scene.control.ProgressIndicator;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.cell.PropertyValueFactory;

import java.net.URL;
import java.util.List;
import java.util.ResourceBundle;
import java.util.concurrent.CompletableFuture;

public class KiemTraCaThiController implements Initializable {

    @FXML
    private TableView<ExamSession> tableView;
    @FXML
    private TableColumn<ExamSession, String> colMaCaThi;
    @FXML
    private TableColumn<ExamSession, String> colTenMonHoc;
    @FXML
    private TableColumn<ExamSession, String> colPhongThi;
    @FXML
    private TableColumn<ExamSession, String> colNgayThi;
    @FXML
    private TableColumn<ExamSession, String> colGioThi;
    @FXML
    private TableColumn<ExamSession, String> colTrangThai;

    @FXML
    private ProgressIndicator loadingIndicator; // Chỉ báo tải

    private ApiService apiService;
    private ObservableList<ExamSession> examSessionList;

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        apiService = new ApiService();
        examSessionList = FXCollections.observableArrayList();
        
        setupTableColumns();
        loadExamSessions(); // Tải dữ liệu khi khởi tạo
    }

    /**
     * Cấu hình các cột TableView để khớp với thuộc tính của model ExamSession
     */
    private void setupTableColumns() {
        // "maCaThi", "tenMonHoc", ... phải khớp chính xác tên thuộc tính trong ExamSession.java
        colMaCaThi.setCellValueFactory(new PropertyValueFactory<>("maCaThi"));
        colTenMonHoc.setCellValueFactory(new PropertyValueFactory<>("tenMonHoc"));
        colPhongThi.setCellValueFactory(new PropertyValueFactory<>("phongThi"));
        colNgayThi.setCellValueFactory(new PropertyValueFactory<>("ngayThi"));
        colGioThi.setCellValueFactory(new PropertyValueFactory<>("gioThi"));
        colTrangThai.setCellValueFactory(new PropertyValueFactory<>("trangThai"));
        
        tableView.setItems(examSessionList);
    }

    /**
     * Tải dữ liệu (tất cả ca thi) từ API và cập nhật TableView
     */
    private void loadExamSessions() {
        setLoading(true); // Hiển thị chỉ báo tải

        CompletableFuture<ApiResponse<ExamSession>> future = apiService.fetchAllExamsForToday();

        future.whenComplete((apiResponse, throwable) -> {
            Platform.runLater(() -> { // Luôn cập nhật UI trên luồng JavaFX
                setLoading(false); // Ẩn chỉ báo tải

                if (throwable != null) {
                    // Xử lý lỗi (ví dụ: mất kết nối, phân tích JSON sai)
                    showAlert("Lỗi Kết Nối", "Không thể tải dữ liệu: " + throwable.getMessage());
                } else if (apiResponse != null && "OK".equals(apiResponse.getMessage())) { // Giả sử "OK" là thông điệp thành công
                    examSessionList.setAll(apiResponse.getData());
                    if (apiResponse.getData().isEmpty()) {
                        showAlert("Thông báo", "Không có ca thi nào cho hôm nay.");
                    }
                } else {
                    // Xử lý lỗi từ API (ví dụ: message = "Error")
                    showAlert("Lỗi API", "API trả về lỗi: " + (apiResponse != null ? apiResponse.getMessage() : "Null response"));
                }
            });
        });
    }

    /**
     * Xử lý sự kiện khi nhấn nút Làm mới
     */
    @FXML
    private void handleRefreshButton() {
        loadExamSessions();
    }
    
    // (Tùy chọn) Hàm xử lý cho nút Lọc theo phòng (nếu bạn thêm)
    /*
    @FXML
    private void handleFilterButton() {
        String roomName = roomFilterField.getText();
        if (roomName == null || roomName.trim().isEmpty()) {
            loadExamSessions(); // Nếu ô lọc trống, tải tất cả
        } else {
            // Gọi hàm fetchExamsByRoomForToday... (tương tự như loadExamSessions)
        }
    }
    */

    // Hàm tiện ích hiển thị chỉ báo tải
    private void setLoading(boolean isLoading) {
        loadingIndicator.setVisible(isLoading);
        tableView.setVisible(!isLoading); // Ẩn bảng khi tải, hiện khi xong
    }

    // Hàm tiện ích hiển thị thông báo lỗi
    private void showAlert(String title, String content) {
        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(content);
        alert.showAndWait();
    }
}