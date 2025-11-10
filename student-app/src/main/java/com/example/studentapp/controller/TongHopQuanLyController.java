// File: src/main/java/com/example/studentapp/controller/TongHopQuanLyController.java
package com.example.studentapp.controller;

import com.example.studentapp.model.CaThi;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.*;
import java.net.URL;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.ResourceBundle;

public class TongHopQuanLyController implements Initializable {

    @FXML private TableView<CaThi> caThiTable;
    @FXML private TableColumn<CaThi, String> maHPColumn;
    @FXML private TableColumn<CaThi, String> tenHPColumn;
    @FXML private TableColumn<CaThi, String> ngayThiColumn;

    @FXML private Label detailTitleLabel;
    @FXML private TextField maHPField;
    @FXML private TextField tenHPField;
    @FXML private DatePicker ngayThiPicker;
    @FXML private ComboBox<String> caThiComboBox;
    @FXML private TextField phongThiField;

    private final ObservableList<CaThi> caThiList = FXCollections.observableArrayList();
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        maHPColumn.setCellValueFactory(cellData -> cellData.getValue().maHPProperty());
        tenHPColumn.setCellValueFactory(cellData -> cellData.getValue().tenHPProperty());
        ngayThiColumn.setCellValueFactory(cellData -> cellData.getValue().ngayThiProperty());

        loadSampleData();
        caThiTable.setItems(caThiList);

        caThiTable.getSelectionModel().selectedItemProperty().addListener(
                (observable, oldValue, newValue) -> showCaThiDetails(newValue)
        );
        
        caThiComboBox.getItems().addAll("Sáng (7:30 - 9:30)", "Chiều (13:30 - 15:30)");

        showCaThiDetails(null);
    }

    private void showCaThiDetails(CaThi caThi) {
        if (caThi != null) {
            detailTitleLabel.setText("Chi tiết ca thi: " + caThi.getMaHP());
            maHPField.setText(caThi.getMaHP());
            tenHPField.setText(caThi.getTenHP());
            phongThiField.setText(caThi.getPhongThi());
            caThiComboBox.setValue(caThi.getCaThi());
            ngayThiPicker.setValue(LocalDate.parse(caThi.getNgayThi(), dateFormatter));
        } else {
            detailTitleLabel.setText("Chi tiết ca thi");
            maHPField.clear();
            tenHPField.clear();
            phongThiField.clear();
            caThiComboBox.getSelectionModel().clearSelection();
            ngayThiPicker.setValue(null);
        }
    }

    @FXML
    private void handleNew() {
        caThiTable.getSelectionModel().clearSelection();
        showCaThiDetails(null);
        detailTitleLabel.setText("Thêm ca thi mới");
        maHPField.requestFocus();
    }

    @FXML
    private void handleDelete() {
        CaThi selectedCaThi = caThiTable.getSelectionModel().getSelectedItem();
        if (selectedCaThi != null) {
            Alert alert = new Alert(Alert.AlertType.CONFIRMATION);
            alert.setTitle("Xác nhận xóa");
            alert.setHeaderText("Bạn có chắc muốn xóa ca thi: " + selectedCaThi.getMaHP() + "?");
            Optional<ButtonType> option = alert.showAndWait();
            if (option.isPresent() && option.get() == ButtonType.OK) {
                caThiList.remove(selectedCaThi);
            }
        } else {
            new Alert(Alert.AlertType.WARNING, "Vui lòng chọn một ca thi để xóa.").show();
        }
    }

    @FXML
    private void handleSave() {
        if (!isInputValid()) return;

        CaThi selectedCaThi = caThiTable.getSelectionModel().getSelectedItem();
        CaThi updatedCaThi = createCaThiFromForm();
        
        if (selectedCaThi != null) {
            int selectedIndex = caThiList.indexOf(selectedCaThi);
            caThiList.set(selectedIndex, updatedCaThi);
        } else {
            caThiList.add(updatedCaThi);
        }
        caThiTable.getSelectionModel().select(updatedCaThi);
    }
    
    private boolean isInputValid() {
        String errorMessage = "";
        if (maHPField.getText() == null || maHPField.getText().isEmpty()) errorMessage += "Mã học phần không được để trống!\n";
        if (tenHPField.getText() == null || tenHPField.getText().isEmpty()) errorMessage += "Tên học phần không được để trống!\n";
        if (ngayThiPicker.getValue() == null) errorMessage += "Ngày thi không được để trống!\n";
        if (caThiComboBox.getValue() == null) errorMessage += "Ca thi không được để trống!\n";
        if (phongThiField.getText() == null || phongThiField.getText().isEmpty()) errorMessage += "Phòng thi không được để trống!\n";

        if (errorMessage.isEmpty()) {
            return true;
        } else {
            new Alert(Alert.AlertType.WARNING, errorMessage).show();
            return false;
        }
    }
    
    private CaThi createCaThiFromForm() {
        return new CaThi(
            maHPField.getText(),
            tenHPField.getText(),
            ngayThiPicker.getValue().format(dateFormatter),
            caThiComboBox.getValue(),
            phongThiField.getText()
        );
    }

    private void loadSampleData() {
        caThiList.add(new CaThi("IT4440", "Lập trình mạng", "20/12/2025", "Sáng (7:30 - 9:30)", "D9-201"));
        caThiList.add(new CaThi("IT3080", "Cơ sở dữ liệu", "22/12/2025", "Chiều (13:30 - 15:30)", "D9-303"));
    }
}