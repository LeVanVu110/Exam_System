package com.example.studentapp.controller;

import com.example.studentapp.model.LichThi;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
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

    private ObservableList<LichThi> lichThiData = FXCollections.observableArrayList();

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

        // Gán danh sách (rỗng) cho TableView. Dữ liệu sẽ không có sẵn.
        lichThiTable.setItems(lichThiData);
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

        lichThiData.add(newLichThi);
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
            lichThiData.remove(selected);
        } else {
            showAlert(Alert.AlertType.WARNING, "Chưa chọn", "Vui lòng chọn một dòng trong bảng để xóa.");
        }
    }
    
    @FXML
    void handleUpdateButton(ActionEvent event) {
        showAlert(Alert.AlertType.INFORMATION, "Thông báo", "Chức năng cập nhật đang được phát triển.");
    }

    private void showAlert(Alert.AlertType alertType, String title, String message) {
        Alert alert = new Alert(alertType);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }
}