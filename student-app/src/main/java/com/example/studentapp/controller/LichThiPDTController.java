package com.example.studentapp.controller;

import com.example.studentapp.model.ApiResponse;
import com.example.studentapp.model.ExamSession;
import com.example.studentapp.service.ApiService;
import javafx.application.Platform;
import javafx.collections.FXCollections;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.ComboBox;
import javafx.scene.control.DatePicker;
import javafx.scene.control.TextField;
import java.net.URL;
import java.time.format.DateTimeFormatter;
import java.util.ResourceBundle;
import java.util.concurrent.CompletableFuture;
import javafx.stage.Stage; 

public class LichThiPDTController implements Initializable {

    @FXML private TextField txtMaCaThi;
    @FXML private TextField txtTenMonHoc;
    @FXML private TextField txtCanBoCoiThi;
    @FXML private TextField txtPhongThi;
    @FXML private DatePicker dateNgayThi;
    @FXML private TextField txtGioThi;
    @FXML private ComboBox<String> comboTrangThai;
    @FXML private Button btnLuu;

    private ApiService apiService;
    
    // --- FIX LỖI: Đổi kiểu sang QuanLyLichThiController ---
    private QuanLyLichThiController parentController; 
    
    // --- FIX LỖI: Đổi kiểu trong Setter ---
    public void setParentController(QuanLyLichThiController controller) {
        this.parentController = controller;
    }
    // --------------------------------------------------------

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        apiService = new ApiService();
        
        comboTrangThai.setItems(FXCollections.observableArrayList(
                "Chưa diễn ra",
                "Đang diễn ra",
                "Đã kết thúc"
        ));
    }

    /**
     * Xử lý khi nhấn nút "Lưu Lịch Thi"
     */
    @FXML
    private void handleSaveButton() {
        // 1. Thu thập dữ liệu từ Form
        String maCaThi = txtMaCaThi.getText();
        String tenMonHoc = txtTenMonHoc.getText();
        String canBoCoiThi = txtCanBoCoiThi.getText();
        String phongThi = txtPhongThi.getText();
        String ngayThi = "";
        if (dateNgayThi.getValue() != null) {
            ngayThi = dateNgayThi.getValue().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        }
        String gioThi = txtGioThi.getText();
        String trangThai = comboTrangThai.getValue();

        // 2. Kiểm tra (Validate) dữ liệu đơn giản
        if (maCaThi.isEmpty() || tenMonHoc.isEmpty() || ngayThi.isEmpty() || gioThi.isEmpty() || trangThai == null) {
            showAlert(Alert.AlertType.ERROR, "Lỗi Nhập Liệu", "Vui lòng nhập đầy đủ các trường bắt buộc.");
            return;
        }

        // 3. Tạo đối tượng ExamSession mới
        ExamSession newSession = new ExamSession();
        newSession.setMaCaThi(maCaThi);
        newSession.setTenMonHoc(tenMonHoc);
        newSession.setCanBoCoiThi(canBoCoiThi);
        newSession.setPhongThi(phongThi);
        newSession.setNgayThi(ngayThi);
        newSession.setGioThi(gioThi);
        newSession.setTrangThai(trangThai);
        // Giả sử các trường khác trong ExamSession.java đã được thêm (maHP, lopSV, v.v.)
        newSession.setSoBaiNop(0);
        newSession.setSoMayTrong(0);


        // 4. Gọi API Service để tạo mới (POST)
        
        btnLuu.setDisable(true); 
        
        CompletableFuture<ApiResponse<ExamSession>> future = apiService.createExamSession(newSession); 

        future.whenComplete((apiResponse, throwable) -> {
            Platform.runLater(() -> {
                btnLuu.setDisable(false);

                if (throwable != null) {
                    showAlert(Alert.AlertType.ERROR, "Lỗi Kết Nối", "Không thể tạo lịch thi: " + throwable.getMessage());
                } else if (apiResponse != null && "OK".equals(apiResponse.getMessage())) {
                    
                    showAlert(Alert.AlertType.INFORMATION, "Thành công", "Đã tạo lịch thi " + maCaThi + " thành công!");
                    clearForm(); 

                    // 🚀 BƯỚC QUAN TRỌNG: LÀM MỚI BẢNG CHÍNH VÀ ĐÓNG FORM
                    if (parentController != null) {
                        // Gọi hàm loadData() của Controller cha
                        parentController.loadExamSessions(); 
                    }
                    
                    // Đóng cửa sổ hiện tại
                    Stage stage = (Stage) btnLuu.getScene().getWindow();
                    stage.close();
                    
                } else {
                    showAlert(Alert.AlertType.ERROR, "Lỗi API", "API trả về lỗi: " + (apiResponse != null ? apiResponse.getMessage() : "Null response"));
                }
            });
        });
    }

    /**
     * Hàm xóa trắng các ô sau khi lưu
     */
    private void clearForm() {
        txtMaCaThi.clear();
        txtTenMonHoc.clear();
        txtCanBoCoiThi.clear();
        txtPhongThi.clear();
        dateNgayThi.setValue(null);
        txtGioThi.clear();
        comboTrangThai.setValue(null);
    }

    private void showAlert(Alert.AlertType alertType, String title, String content) {
        Alert alert = new Alert(alertType);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(content);
        alert.showAndWait();
    }
}