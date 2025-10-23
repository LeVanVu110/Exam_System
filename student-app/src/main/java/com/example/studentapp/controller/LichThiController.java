package com.example.studentapp.controller;

import com.example.studentapp.model.LichThi;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.collections.transformation.FilteredList; // THÊM MỚI IMPORT
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import java.time.LocalDate;

public class LichThiController {

    // --- TableView and TableColumns ---
    @FXML private TableView<LichThi> lichThiTable;
    @FXML private TableColumn<LichThi, String> maHPColumn;
    @FXML private TableColumn<LichThi, String> tenHPColumn;
    @FXML private TableColumn<LichThi, String> lopSVColumn;
    @FXML private TableColumn<LichThi, LocalDate> ngayThiColumn;
    @FXML private TableColumn<LichThi, String> gioThiColumn;
    @FXML private TableColumn<LichThi, String> phongThiColumn;
    @FXML private TableColumn<LichThi, String> soSVColumn;
    @FXML private TableColumn<LichThi, String> htThiColumn;
    @FXML private TableColumn<LichThi, String> cbctColumn;

    // --- Input Fields ---
    @FXML private TextField maHPField;
    @FXML private TextField tenHPField;
    @FXML private TextField lopSVField;
    @FXML private DatePicker ngayThiPicker;
    @FXML private TextField gioThiField;
    @FXML private TextField phongThiField;
    @FXML private TextField soSVField;
    @FXML private TextField htThiField;
    @FXML private TextField cbctField;
    
    // THÊM MỚI: Ô tìm kiếm
    @FXML private TextField searchField; 

    // THAY ĐỔI: Đổi tên 'lichThiData' thành 'masterData' (danh sách gốc)
    private ObservableList<LichThi> masterData = FXCollections.observableArrayList();
    
    // THÊM MỚI: Danh sách đã lọc để hiển thị
    private FilteredList<LichThi> filteredData;

    @FXML
    public void initialize() {
        // Liên kết các cột trong TableView với các thuộc tính trong class LichThi
        maHPColumn.setCellValueFactory(new PropertyValueFactory<>("maHP"));
        tenHPColumn.setCellValueFactory(new PropertyValueFactory<>("tenHP"));
        lopSVColumn.setCellValueFactory(new PropertyValueFactory<>("lopSV"));
        ngayThiColumn.setCellValueFactory(new PropertyValueFactory<>("ngayThi"));
        gioThiColumn.setCellValueFactory(new PropertyValueFactory<>("gioThi"));
        phongThiColumn.setCellValueFactory(new PropertyValueFactory<>("phongThi"));
        soSVColumn.setCellValueFactory(new PropertyValueFactory<>("soSV"));
        htThiColumn.setCellValueFactory(new PropertyValueFactory<>("htThi"));
        cbctColumn.setCellValueFactory(new PropertyValueFactory<>("cbct"));

        // --- THAY ĐỔI LOGIC LỌC ---
        
        // 1. (Tùy chọn) Thêm data giả để test
        loadMockData(); 
        
        // 2. Bọc masterData (danh sách gốc) bằng FilteredList
        filteredData = new FilteredList<>(masterData, p -> true); // p -> true là hiển thị tất cả ban đầu

        // 3. Gán danh sách ĐÃ LỌC (filteredData) cho TableView
        lichThiTable.setItems(filteredData);

        // 4. THÊM MỚI: Thêm listener (theo dõi) cho ô tìm kiếm
        searchField.textProperty().addListener((observable, oldValue, newValue) -> {
            filteredData.setPredicate(lichThi -> {
                // Nếu ô tìm kiếm trống, hiển thị tất cả
                if (newValue == null || newValue.isEmpty()) {
                    return true;
                }

                // Chuẩn hóa từ khóa tìm kiếm (cho không phân biệt hoa thường)
                String lowerCaseFilter = newValue.toLowerCase();

                // Logic lọc: kiểm tra nhiều trường
                if (lichThi.getMaHP().toLowerCase().contains(lowerCaseFilter)) {
                    return true; // Lọc theo Mã HP
                } else if (lichThi.getTenHP().toLowerCase().contains(lowerCaseFilter)) {
                    return true; // Lọc theo Tên HP
                } else if (lichThi.getLopSV().toLowerCase().contains(lowerCaseFilter)) {
                    return true; // Lọc theo Lớp SV
                }
                
                return false; // Không tìm thấy
            });
        });
    }

    @FXML
    void handleAddButton(ActionEvent event) {
        if (ngayThiPicker.getValue() == null || maHPField.getText().trim().isEmpty() || tenHPField.getText().trim().isEmpty()) {
            showAlert(Alert.AlertType.ERROR, "Lỗi Nhập Liệu", "Mã HP, Tên HP và Ngày thi là bắt buộc.");
            return;
        }

        LichThi newLichThi = new LichThi(
                maHPField.getText(),
                tenHPField.getText(),
                lopSVField.getText(),
                ngayThiPicker.getValue(),
                gioThiField.getText(),
                phongThiField.getText(),
                soSVField.getText(),
                htThiField.getText(),
                cbctField.getText()
        );

        // THAY ĐỔI: Thêm vào danh sách GỐC (masterData)
        masterData.add(newLichThi);
        handleClearButton(null);
    }

    @FXML
    void handleClearButton(ActionEvent event) {
        maHPField.clear();
        tenHPField.clear();
        lopSVField.clear();
        ngayThiPicker.setValue(null);
        gioThiField.clear();
        phongThiField.clear();
        soSVField.clear();
        htThiField.clear();
        cbctField.clear();
    }

    @FXML
    void handleDeleteButton(ActionEvent event) {
        LichThi selected = lichThiTable.getSelectionModel().getSelectedItem();
        if (selected != null) {
            // THAY ĐỔI: Xóa khỏi danh sách GỐC (masterData)
            masterData.remove(selected);
        } else {
            showAlert(Alert.AlertType.WARNING, "Chưa chọn", "Vui lòng chọn một dòng trong bảng để xóa.");
        }
    }
    
    @FXML
    void handleUpdateButton(ActionEvent event) {
        showAlert(Alert.AlertType.INFORMATION, "Thông báo", "Chức năng cập nhật đang được phát triển.");
        // Ghi chú: Khi làm chức năng Sửa, bạn chỉ cần Sửa đối tượng 'selected'
        // trong 'masterData'. Bảng sẽ tự cập nhật.
    }

    private void showAlert(Alert.AlertType alertType, String title, String message) {
        Alert alert = new Alert(alertType);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }
    
    // (Tùy chọn) Hàm này để thêm data giả, giúp bạn test chức năng lọc ngay
    private void loadMockData() {
        masterData.add(new LichThi("IT101", "Lập trình Java", "DH22IT", LocalDate.now(), "07:30", "A1.101", "120", "Trắc nghiệm", "Nguyễn Văn A"));
        masterData.add(new LichThi("IT102", "Cơ sở dữ liệu", "DH22IT", LocalDate.now().plusDays(1), "09:30", "A1.102", "120", "Tự luận", "Trần Thị B"));
        masterData.add(new LichThi("EN003", "Tiếng Anh 3", "DH22NN", LocalDate.now().plusDays(2), "07:30", "B2.205", "50", "Vấn đáp", "Lê Văn C"));
    }
}