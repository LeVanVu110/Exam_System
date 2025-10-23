package com.example.studentapp.controller;

import com.example.studentapp.model.LichThi;
import com.example.studentapp.service.LichThiService;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.collections.transformation.FilteredList;
import javafx.concurrent.Task;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;

import java.time.LocalDate;
import java.util.List;

public class LichThiController {

    // --- TableView and Columns (Phải khớp với fx:id trong FXML) ---
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

    // --- Input Fields (Phải khớp với fx:id trong FXML) ---
    @FXML private TextField maHPField;
    @FXML private TextField tenHPField;
    @FXML private TextField lopSVField;
    @FXML private DatePicker ngayThiPicker;
    @FXML private TextField gioThiField;
    @FXML private TextField phongThiField;
    @FXML private TextField soSVField;
    @FXML private TextField htThiField;
    @FXML private TextField cbctField;
    @FXML private TextField searchField;
    
    // (Tùy chọn) Vòng xoay loading
    @FXML private ProgressIndicator loadingIndicator;

    // Danh sách gốc (master) chứa TẤT CẢ dữ liệu (từ API)
    private final ObservableList<LichThi> masterData = FXCollections.observableArrayList();
    
    // Danh sách đã lọc (dùng để hiển thị)
    private FilteredList<LichThi> filteredData;
    
    // Khởi tạo Service
    private final LichThiService lichThiService = new LichThiService();


    /**
     * Hàm này được gọi tự động khi FXML được load
     */
    @FXML
    public void initialize() {
        // 1. Cấu hình cột
        maHPColumn.setCellValueFactory(new PropertyValueFactory<>("maHP"));
        tenHPColumn.setCellValueFactory(new PropertyValueFactory<>("tenHP"));
        lopSVColumn.setCellValueFactory(new PropertyValueFactory<>("lopSV"));
        ngayThiColumn.setCellValueFactory(new PropertyValueFactory<>("ngayThi"));
        gioThiColumn.setCellValueFactory(new PropertyValueFactory<>("gioThi"));
        phongThiColumn.setCellValueFactory(new PropertyValueFactory<>("phongThi"));
        soSVColumn.setCellValueFactory(new PropertyValueFactory<>("soSV"));
        htThiColumn.setCellValueFactory(new PropertyValueFactory<>("htThi"));
        cbctColumn.setCellValueFactory(new PropertyValueFactory<>("cbct"));

        // 2. Cấu hình logic Lọc (Filter)
        filteredData = new FilteredList<>(masterData, p -> true);
        lichThiTable.setItems(filteredData);
        
        searchField.textProperty().addListener((observable, oldValue, newValue) -> {
            filteredData.setPredicate(lichThi -> {
                if (newValue == null || newValue.isEmpty()) {
                    return true;
                }
                String lowerCaseFilter = newValue.toLowerCase();
                if (lichThi.getMaHP().toLowerCase().contains(lowerCaseFilter)) {
                    return true; 
                } else if (lichThi.getTenHP().toLowerCase().contains(lowerCaseFilter)) {
                    return true; 
                }
                return false; // Không khớp
            });
        });

        // 3. Tải dữ liệu từ API
        taiDuLieuTuApi();
    }

    /**
     * Tải dữ liệu từ API trên luồng nền (Task) để không làm đơ app
     */
    private void taiDuLieuTuApi() {
        if (loadingIndicator != null) loadingIndicator.setVisible(true);
        lichThiTable.setVisible(false);

        Task<List<LichThi>> loadDataTask = new Task<>() {
            @Override
            protected List<LichThi> call() throws Exception {
                // Gọi service
                return lichThiService.getLichThiTuApi();
            }
        };

        loadDataTask.setOnSucceeded(event -> {
            List<LichThi> ketQua = loadDataTask.getValue();
            masterData.setAll(ketQua); // Đổ dữ liệu vào danh sách gốc
            
            if (loadingIndicator != null) loadingIndicator.setVisible(false);
            lichThiTable.setVisible(true);
            System.out.println("Tải API thành công!");
        });

        loadDataTask.setOnFailed(event -> {
            if (loadingIndicator != null) loadingIndicator.setVisible(false);
            Throwable e = loadDataTask.getException();
            showAlert(Alert.AlertType.ERROR, "Lỗi Tải Dữ Liệu", "Không thể kết nối API: " + e.getMessage());
            e.printStackTrace();
        });

        new Thread(loadDataTask).start();
    }

    // --- Các hàm xử lý sự kiện (Button Click) ---

    @FXML
    void handleAddButton(ActionEvent event) {
        if (!validateInput()) return;

        LichThi newLichThi = new LichThi(
                maHPField.getText(), tenHPField.getText(), lopSVField.getText(),
                ngayThiPicker.getValue(), gioThiField.getText(), phongThiField.getText(),
                soSVField.getText(), htThiField.getText(), cbctField.getText()
        );

        masterData.add(newLichThi); // Thêm vào danh sách gốc
        handleClearButton(null);
        // (Trong dự án thật, bạn sẽ gọi API POST để lưu)
    }

    @FXML
    void handleDeleteButton(ActionEvent event) {
        LichThi selected = lichThiTable.getSelectionModel().getSelectedItem();
        if (selected != null) {
            masterData.remove(selected); // Xóa khỏi danh sách gốc
            // (Trong dự án thật, bạn sẽ gọi API DELETE)
        } else {
            showAlert(Alert.AlertType.WARNING, "Chưa chọn", "Vui lòng chọn một dòng để xóa.");
        }
    }
    
    @FXML
    void handleUpdateButton(ActionEvent event) {
        LichThi selected = lichThiTable.getSelectionModel().getSelectedItem();
        if (selected == null) {
            showAlert(Alert.AlertType.WARNING, "Chưa chọn", "Vui lòng chọn một dòng để cập nhật.");
            return;
        }
        if (!validateInput()) return;

        // Cập nhật đối tượng 'selected'
        selected.setMaHP(maHPField.getText());
        selected.setTenHP(tenHPField.getText());
        selected.setLopSV(lopSVField.getText());
        selected.setNgayThi(ngayThiPicker.getValue());
        selected.setGioThi(gioThiField.getText());
        selected.setPhongThi(phongThiField.getText());
        selected.setSoSV(soSVField.getText());
        selected.setHtThi(htThiField.getText());
        selected.setCbct(cbctField.getText());

        lichThiTable.refresh(); // Làm mới bảng
        showAlert(Alert.AlertType.INFORMATION, "Thành công", "Đã cập nhật lịch thi.");
        // (Trong dự án thật, bạn sẽ gọi API PUT/PATCH)
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
        lichThiTable.getSelectionModel().clearSelection();
    }
    
    /**
     * Hàm này được gọi khi click vào 1 dòng trên bảng
     * (Phải kết nối trong FXML)
     */
    @FXML
    void handleRowSelect() {
        LichThi selected = lichThiTable.getSelectionModel().getSelectedItem();
        if (selected != null) {
            // Đổ dữ liệu từ 'selected' vào các ô input
            maHPField.setText(selected.getMaHP());
            tenHPField.setText(selected.getTenHP());
            lopSVField.setText(selected.getLopSV());
            ngayThiPicker.setValue(selected.getNgayThi());
            gioThiField.setText(selected.getGioThi());
            phongThiField.setText(selected.getPhongThi());
            soSVField.setText(selected.getSoSV());
            htThiField.setText(selected.getHtThi());
            cbctField.setText(selected.getCbct());
        }
    }

    // --- Hàm tiện ích ---

    private boolean validateInput() {
        if (ngayThiPicker.getValue() == null || maHPField.getText().trim().isEmpty() || tenHPField.getText().trim().isEmpty()) {
            showAlert(Alert.AlertType.ERROR, "Lỗi Nhập Liệu", "Mã HP, Tên HP và Ngày thi là bắt buộc.");
            return false;
        }
        return true;
    }

    private void showAlert(Alert.AlertType alertType, String title, String message) {
        Alert alert = new Alert(alertType);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }
}