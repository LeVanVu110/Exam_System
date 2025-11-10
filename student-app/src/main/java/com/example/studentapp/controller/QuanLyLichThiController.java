package com.example.studentapp.controller;

import com.example.studentapp.model.ApiResponse;
import com.example.studentapp.model.ExamSession;
import com.example.studentapp.service.ApiService;
import javafx.application.Platform;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Parent; // <-- ĐÃ SỬA LỖI THIẾU IMPORT NÀY
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.stage.Stage;

import java.io.IOException;
import java.net.URL;
import java.util.Optional;
import java.util.ResourceBundle;
import java.util.concurrent.CompletableFuture;

public class QuanLyLichThiController implements Initializable {

    // --- Bảng Hiển Thị (Cần khớp với FXML của bạn) ---
    @FXML private TableView<ExamSession> tableView;
    @FXML private TableColumn<ExamSession, String> colMaHP; 
    @FXML private TableColumn<ExamSession, String> colTenHP; 
    @FXML private TableColumn<ExamSession, String> colLopSV; 
    // ... Thêm các cột khác tương ứng từ FXML của bạn ...

    // --- Form Chi Tiết/Chỉnh Sửa ---
    @FXML private TextField txtMaHocPhan;
    @FXML private TextField txtTenHocPhan;
    @FXML private TextField txtLopSV;
    @FXML private TextField txtNgayThi; 
    @FXML private TextField txtGioThi;
    @FXML private TextField txtPhongThi;
    @FXML private TextField txtSoSV;
    @FXML private TextField txtHinhThucThi;
    @FXML private TextField txtCanBoCoiThi; 

    // --- Nút Chức Năng ---
    @FXML private Button btnThem;
    @FXML private Button btnSua;
    @FXML private Button btnXoa;

    private ApiService apiService;
    private ObservableList<ExamSession> examSessionList;
    private ExamSession selectedSession; 

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        apiService = new ApiService();
        examSessionList = FXCollections.observableArrayList();
        
        setupTableColumns();
        loadExamSessions();
        
        // Bắt sự kiện chọn hàng
        tableView.getSelectionModel().selectedItemProperty().addListener(
            (obs, oldSelection, newSelection) -> {
                selectedSession = newSelection;
                if (newSelection != null) {
                    fillFormWithDetails(newSelection);
                    btnSua.setDisable(false);
                    btnXoa.setDisable(false);
                } else {
                    clearForm();
                    btnSua.setDisable(true);
                    btnXoa.setDisable(true);
                }
            }
        );
        
        btnSua.setDisable(true);
        btnXoa.setDisable(true);
    }

    private void setupTableColumns() {
        // Cấu hình các cột (cần khớp với Model ExamSession)
        colMaHP.setCellValueFactory(new PropertyValueFactory<>("maHP")); 
        colTenHP.setCellValueFactory(new PropertyValueFactory<>("tenHP"));
        colLopSV.setCellValueFactory(new PropertyValueFactory<>("lopSV"));
        // ... (Cấu hình các cột còn lại)
        tableView.setItems(examSessionList);
    }

    // Tải dữ liệu từ API (READ)
    public void loadExamSessions() { 
        apiService.fetchAllExamsForToday()
            .thenAccept(apiResponse -> {
                Platform.runLater(() -> {
                    if (apiResponse != null && "OK".equals(apiResponse.getMessage())) {
                        examSessionList.setAll(apiResponse.getData());
                    } else {
                        showAlert(Alert.AlertType.ERROR, "Lỗi Tải Dữ Liệu", "Không thể tải danh sách lịch thi.");
                    }
                });
            })
            .exceptionally(ex -> {
                Platform.runLater(() -> showAlert(Alert.AlertType.ERROR, "Lỗi Kết Nối", "Kiểm tra API Backend/Mockoon."));
                return null;
            });
    }

    // Đổ dữ liệu từ bảng sang Form
    private void fillFormWithDetails(ExamSession session) {
        // Cần chỉnh sửa để khớp với model và các trường TextField của bạn
        txtMaHocPhan.setText(session.getMaHP()); 
        txtTenHocPhan.setText(session.getTenHP());
        txtLopSV.setText(session.getLopSV());
        txtNgayThi.setText(session.getNgayThi()); 
        txtGioThi.setText(session.getGioThi());
        txtPhongThi.setText(session.getPhongThi());
        txtSoSV.setText(session.getSoSV()); // Giả sử Số SV là String
        txtHinhThucThi.setText(session.getHinhThucThi());
        txtCanBoCoiThi.setText(session.getCanBoCoiThi());
    }

    // Xóa Form
    private void clearForm() {
        txtMaHocPhan.clear();
        txtTenHocPhan.clear();
        txtLopSV.clear();
        txtNgayThi.clear();
        txtGioThi.clear();
        txtPhongThi.clear();
        txtSoSV.clear();
        txtHinhThucThi.clear();
        txtCanBoCoiThi.clear();
    }

    // --- Xử lý Nút Chức Năng (CRUD) ---

    @FXML
    private void handleAddButton() {
        // Chức năng THÊM (mở Form LichThiPDTView.fxml)
        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/view/pages/LichThiPDTView.fxml")); 
            Parent root = loader.load();
            
            // 1. Lấy Controller của Form PĐT
            LichThiPDTController formController = loader.getController();
            
            // 2. TRUYỀN THAM CHIẾU để Form con có thể gọi hàm loadExamSessions() của Form cha
            // LƯU Ý: Đã sửa tham chiếu thành 'this' (QuanLyLichThiController)
            formController.setParentController(this); 
            
            // 3. Hiển thị cửa sổ mới
            Stage formStage = new Stage();
            formStage.setTitle("Thêm Lịch Thi Mới");
            formStage.setScene(new Scene(root));
            formStage.show();

        } catch (IOException e) { // Sửa lỗi Catch Exception
            e.printStackTrace();
            showAlert(Alert.AlertType.ERROR, "Lỗi Tải Form", "Không thể mở Form Lịch Thi.");
        }
    }

    @FXML
    private void handleEditButton() {
        // Chức năng SỬA (UPDATE)
        if (selectedSession == null) return;
        
        // 1. Tạo đối tượng ExamSession đã chỉnh sửa
        ExamSession updatedSession = new ExamSession();
        // Giữ nguyên ID cũ
        updatedSession.setMaCaThi(selectedSession.getMaCaThi()); 
        
        // Lấy dữ liệu mới từ Form và gán cho Model
        updatedSession.setMaHP(txtMaHocPhan.getText());
        updatedSession.setTenHP(txtTenHocPhan.getText());
        updatedSession.setLopSV(txtLopSV.getText());
        updatedSession.setNgayThi(txtNgayThi.getText());
        updatedSession.setGioThi(txtGioThi.getText());
        updatedSession.setPhongThi(txtPhongThi.getText());
        
        // Cần đảm bảo các trường này là String hoặc chuyển đổi trước khi gán
        updatedSession.setSoSV(txtSoSV.getText()); 
        updatedSession.setHinhThucThi(txtHinhThucThi.getText());
        updatedSession.setCanBoCoiThi(txtCanBoCoiThi.getText());
        
        // Gán lại các giá trị khác để tránh NULL (nếu không được nhập trong form này)
        updatedSession.setTenMonHoc(updatedSession.getTenHP()); // Giả định TenMonHoc = TenHP
        updatedSession.setTrangThai(selectedSession.getTrangThai());
        updatedSession.setSoBaiNop(selectedSession.getSoBaiNop());
        updatedSession.setSoMayTrong(selectedSession.getSoMayTrong());

        // 2. Gọi API Service
        apiService.updateExamSession(updatedSession)
            .thenRun(() -> Platform.runLater(() -> {
                showAlert(Alert.AlertType.INFORMATION, "Thành công", "Cập nhật lịch thi thành công!");
                loadExamSessions(); // Tải lại bảng
            }))
            .exceptionally(ex -> {
                Platform.runLater(() -> showAlert(Alert.AlertType.ERROR, "Lỗi", "Không thể cập nhật: " + ex.getMessage()));
                return null;
            });
    }

    @FXML
    private void handleDeleteButton() {
        // Chức năng XÓA (DELETE)
        if (selectedSession == null) return;
        
        // 1. Alert xác nhận
        Alert confirm = new Alert(Alert.AlertType.CONFIRMATION);
        confirm.setTitle("Xác nhận Xóa");
        confirm.setHeaderText("Bạn có chắc chắn muốn xóa lịch thi này?");
        confirm.setContentText("Mã ca thi: " + selectedSession.getMaCaThi() + " - " + selectedSession.getTenHP());

        Optional<ButtonType> result = confirm.showAndWait();
        
        if (result.isPresent() && result.get() == ButtonType.OK) {
            // 2. Gọi API Service
            apiService.deleteExamSession(selectedSession.getMaCaThi())
                .thenRun(() -> Platform.runLater(() -> {
                    showAlert(Alert.AlertType.INFORMATION, "Thành công", "Xóa lịch thi thành công!");
                    loadExamSessions(); // Tải lại bảng
                }))
                .exceptionally(ex -> {
                    Platform.runLater(() -> showAlert(Alert.AlertType.ERROR, "Lỗi", "Không thể xóa: " + ex.getMessage()));
                    return null;
                });
        }
    }
    
    private void showAlert(Alert.AlertType alertType, String title, String content) {
        Alert alert = new Alert(alertType);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(content);
        alert.showAndWait();
    }
}