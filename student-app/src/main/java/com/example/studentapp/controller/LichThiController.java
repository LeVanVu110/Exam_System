package com.example.studentapp.controller;

import com.example.studentapp.model.ApiResponse;
import com.example.studentapp.model.ExamSession;
import com.example.studentapp.service.ApiService;
import javafx.application.Platform;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.collections.transformation.FilteredList;
import javafx.fxml.FXML;
import javafx.scene.control.Alert;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.TextField;
import javafx.scene.control.cell.PropertyValueFactory;

import java.util.List;

public class LichThiController {

    // --- TableView và Columns (Sử dụng ExamSession) ---
    @FXML
    private TableView<ExamSession> lichThiTable;
    @FXML
    private TableColumn<ExamSession, String> maHPColumn;
    @FXML
    private TableColumn<ExamSession, String> tenHPColumn;
    @FXML
    private TableColumn<ExamSession, String> lopSVColumn;
    @FXML
    private TableColumn<ExamSession, String> ngayThiColumn;
    @FXML
    private TableColumn<ExamSession, String> gioThiColumn;
    @FXML
    private TableColumn<ExamSession, String> phongThiColumn;
    @FXML
    private TableColumn<ExamSession, String> soSVColumn;
    @FXML
    private TableColumn<ExamSession, String> htThiColumn;
    @FXML
    private TableColumn<ExamSession, String> cbctColumn;

    // --- Search Field ---
    @FXML
    private TextField searchField;

    // --- Data Lists ---
    private ObservableList<ExamSession> masterData = FXCollections.observableArrayList();
    private FilteredList<ExamSession> filteredData;
    private ApiService apiService;

    @FXML
    public void initialize() {
        apiService = new ApiService();

        // 1. Cấu hình cột bảng
        setupTableColumns();

        // 2. Cấu hình bộ lọc tìm kiếm
        setupSearchFilter();

        // 3. Load dữ liệu thật từ API
        loadDataFromApi();
    }

    private void setupTableColumns() {
        // Tên thuộc tính phải khớp với getter trong file ExamSession.java
        maHPColumn.setCellValueFactory(new PropertyValueFactory<>("maHP"));
        tenHPColumn.setCellValueFactory(new PropertyValueFactory<>("tenHP"));
        lopSVColumn.setCellValueFactory(new PropertyValueFactory<>("lopSV"));
        ngayThiColumn.setCellValueFactory(new PropertyValueFactory<>("ngayThi"));
        gioThiColumn.setCellValueFactory(new PropertyValueFactory<>("gioThi"));
        phongThiColumn.setCellValueFactory(new PropertyValueFactory<>("phongThi"));
        soSVColumn.setCellValueFactory(new PropertyValueFactory<>("soSV"));

        // Lưu ý: Trong ExamSession tên là "hinhThucThi" và "canBoCoiThi"
        htThiColumn.setCellValueFactory(new PropertyValueFactory<>("hinhThucThi"));
        cbctColumn.setCellValueFactory(new PropertyValueFactory<>("canBoCoiThi"));
    }

    private void loadDataFromApi() {
        // Gọi API lấy danh sách
        apiService.fetchAllExamsList()
                .thenAccept(response -> {
                    Platform.runLater(() -> {
                        if (response != null && "OK".equalsIgnoreCase(response.getStatus())) {
                            List<ExamSession> data = response.getData();
                            if (data != null) {
                                masterData.setAll(data);
                            }
                        } else {
                            showAlert("Lỗi tải dữ liệu", "Không thể lấy danh sách ca thi từ Server.");
                        }
                    });
                })
                .exceptionally(ex -> {
                    Platform.runLater(() -> showAlert("Lỗi kết nối", ex.getMessage()));
                    return null;
                });
    }

    private void setupSearchFilter() {
        // Bọc masterData bằng FilteredList
        filteredData = new FilteredList<>(masterData, p -> true);

        // Gán danh sách đã lọc cho TableView
        lichThiTable.setItems(filteredData);

        // Lắng nghe sự thay đổi trong ô tìm kiếm
        searchField.textProperty().addListener((observable, oldValue, newValue) -> {
            filteredData.setPredicate(exam -> {
                // Nếu ô tìm kiếm trống, hiển thị tất cả
                if (newValue == null || newValue.isEmpty()) {
                    return true;
                }

                String lowerCaseFilter = newValue.toLowerCase();

                // Logic tìm kiếm đa trường (Mã HP, Tên HP, Lớp SV, Phòng thi)
                if (exam.getMaHP().toLowerCase().contains(lowerCaseFilter)) {
                    return true;
                } else if (exam.getTenHP().toLowerCase().contains(lowerCaseFilter)) {
                    return true;
                } else if (exam.getLopSV().toLowerCase().contains(lowerCaseFilter)) {
                    return true;
                } else if (exam.getPhongThi().toLowerCase().contains(lowerCaseFilter)) {
                    return true;
                }
                return false;
            });
        });
    }

    private void showAlert(String title, String content) {
        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(content);
        alert.show();
    }
}