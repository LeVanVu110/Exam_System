package com.example.studentapp.controller;

import com.example.studentapp.model.LichThi;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.collections.transformation.FilteredList;
import javafx.fxml.FXML;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.TextField;
import javafx.scene.control.cell.PropertyValueFactory;
import java.time.LocalDate;

public class LichThiController {

    // --- TableView and TableColumns ---
    @FXML
    private TableView<LichThi> lichThiTable;
    @FXML
    private TableColumn<LichThi, String> maHPColumn;
    @FXML
    private TableColumn<LichThi, String> tenHPColumn;
    @FXML
    private TableColumn<LichThi, String> lopSVColumn;
    @FXML
    private TableColumn<LichThi, LocalDate> ngayThiColumn;
    @FXML
    private TableColumn<LichThi, String> gioThiColumn;
    @FXML
    private TableColumn<LichThi, String> phongThiColumn;
    @FXML
    private TableColumn<LichThi, String> soSVColumn;
    @FXML
    private TableColumn<LichThi, String> htThiColumn;
    @FXML
    private TableColumn<LichThi, String> cbctColumn;

    // --- Search Field ---
    @FXML
    private TextField searchField;

    // --- Data Lists ---
    private ObservableList<LichThi> masterData = FXCollections.observableArrayList();
    private FilteredList<LichThi> filteredData;

    @FXML
    public void initialize() {
        // 1. Cấu hình cột bảng
        setupTableColumns();

        // 2. Load dữ liệu (Giả lập dữ liệu từ phòng đào tạo)
        loadMockData();

        // 3. Cấu hình bộ lọc tìm kiếm
        setupSearchFilter();
    }

    private void setupTableColumns() {
        maHPColumn.setCellValueFactory(new PropertyValueFactory<>("maHP"));
        tenHPColumn.setCellValueFactory(new PropertyValueFactory<>("tenHP"));
        lopSVColumn.setCellValueFactory(new PropertyValueFactory<>("lopSV"));
        ngayThiColumn.setCellValueFactory(new PropertyValueFactory<>("ngayThi"));
        gioThiColumn.setCellValueFactory(new PropertyValueFactory<>("gioThi"));
        phongThiColumn.setCellValueFactory(new PropertyValueFactory<>("phongThi"));
        soSVColumn.setCellValueFactory(new PropertyValueFactory<>("soSV"));
        htThiColumn.setCellValueFactory(new PropertyValueFactory<>("htThi"));
        cbctColumn.setCellValueFactory(new PropertyValueFactory<>("cbct"));
    }

    private void setupSearchFilter() {
        // Bọc masterData bằng FilteredList
        filteredData = new FilteredList<>(masterData, p -> true);

        // Gán danh sách đã lọc cho TableView
        lichThiTable.setItems(filteredData);

        // Lắng nghe sự thay đổi trong ô tìm kiếm
        searchField.textProperty().addListener((observable, oldValue, newValue) -> {
            filteredData.setPredicate(lichThi -> {
                // Nếu ô tìm kiếm trống, hiển thị tất cả
                if (newValue == null || newValue.isEmpty()) {
                    return true;
                }

                String lowerCaseFilter = newValue.toLowerCase();

                // Logic tìm kiếm đa trường
                if (lichThi.getMaHP().toLowerCase().contains(lowerCaseFilter)) {
                    return true;
                } else if (lichThi.getTenHP().toLowerCase().contains(lowerCaseFilter)) {
                    return true;
                } else if (lichThi.getLopSV().toLowerCase().contains(lowerCaseFilter)) {
                    return true;
                }
                return false;
            });
        });
    }

    // Hàm này giả lập dữ liệu lấy từ Server/Database của phòng đào tạo
    private void loadMockData() {
        masterData.add(new LichThi("IT101", "Lập trình Java", "DH22IT", LocalDate.of(2025, 12, 15), "07:30", "A1.101",
                "45", "Trắc nghiệm", "Nguyễn Văn A"));
        masterData.add(new LichThi("IT102", "Cơ sở dữ liệu", "DH22IT", LocalDate.of(2025, 12, 16), "09:30", "A1.102",
                "50", "Tự luận", "Trần Thị B"));
        masterData.add(new LichThi("EN003", "Tiếng Anh 3", "DH22NN", LocalDate.of(2025, 12, 18), "07:30", "B2.205",
                "30", "Vấn đáp", "Lê Văn C"));
        masterData.add(new LichThi("KT201", "Kinh tế vĩ mô", "DH22KT", LocalDate.of(2025, 12, 20), "13:30", "C3.301",
                "60", "Trắc nghiệm", "Phạm Văn D"));
    }
}