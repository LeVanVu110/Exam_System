package com.example.studentapp.controller;

import com.example.studentapp.model.ApiResponse;
import com.example.studentapp.model.ExamSession;
import com.example.studentapp.service.ApiService;

import javafx.application.Platform;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.stage.Stage;

import java.io.IOException;
import java.net.URL;
import java.util.Optional;
import java.util.ResourceBundle;

public class QuanLyLichThiController implements Initializable {

    // --- Bảng Hiển Thị (TableView) ---
    @FXML
    private TableView<ExamSession> tableView;
    @FXML
    private TableColumn<ExamSession, String> colMaHP;
    @FXML
    private TableColumn<ExamSession, String> colTenHP;
    @FXML
    private TableColumn<ExamSession, String> colLopSV;
    @FXML
    private TableColumn<ExamSession, String> colNgayThi;
    @FXML
    private TableColumn<ExamSession, String> colGioThi;
    @FXML
    private TableColumn<ExamSession, String> colPhongThi;
    @FXML
    private TableColumn<ExamSession, String> colHinhThuc;
    @FXML
    private TableColumn<ExamSession, String> colGiamThi;

    // --- Form Chi Tiết/Chỉnh Sửa ---
    @FXML
    private TextField txtMaHocPhan;
    @FXML
    private TextField txtTenHocPhan;
    @FXML
    private TextField txtLopSV;
    @FXML
    private TextField txtNgayThi;
    @FXML
    private TextField txtGioThi;
    @FXML
    private TextField txtPhongThi;
    @FXML
    private TextField txtSoSV;
    @FXML
    private TextField txtHinhThucThi;
    @FXML
    private TextField txtCanBoCoiThi;

    // --- Nút Chức Năng ---
    @FXML
    private Button btnThem;
    @FXML
    private Button btnSua;
    @FXML
    private Button btnXoa;

    // Service và Danh sách dữ liệu
    private ApiService apiService;
    private ObservableList<ExamSession> examSessionList;
    private ExamSession selectedSession;

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        // 1. Khởi tạo Service (QUAN TRỌNG: Phải dùng đúng tên class ApiServiceTuan)
        apiService = new ApiService();

        // 2. Khởi tạo danh sách
        examSessionList = FXCollections.observableArrayList();

        // 3. Cấu hình bảng và tải dữ liệu
        setupTableColumns();
        loadExamSessions();

        // 4. Bắt sự kiện chọn hàng trong bảng
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
                });

        // Mặc định vô hiệu hóa nút Sửa/Xóa khi chưa chọn dòng nào
        btnSua.setDisable(true);
        btnXoa.setDisable(true);
    }

    private void setupTableColumns() {
        // Ánh xạ dữ liệu từ Model vào Cột (Tên chuỗi phải khớp với field trong
        // ExamSession)
        colMaHP.setCellValueFactory(new PropertyValueFactory<>("maHP"));
        colTenHP.setCellValueFactory(new PropertyValueFactory<>("tenHP"));
        colLopSV.setCellValueFactory(new PropertyValueFactory<>("lopSV"));
        colNgayThi.setCellValueFactory(new PropertyValueFactory<>("ngayThi"));
        colGioThi.setCellValueFactory(new PropertyValueFactory<>("gioThi"));
        colPhongThi.setCellValueFactory(new PropertyValueFactory<>("phongThi"));
        colHinhThuc.setCellValueFactory(new PropertyValueFactory<>("hinhThucThi"));
        colGiamThi.setCellValueFactory(new PropertyValueFactory<>("canBoCoiThi"));

        // Gán danh sách dữ liệu vào bảng
        tableView.setItems(examSessionList);
    }

    // =========================================================
    // CÁC HÀM XỬ LÝ DỮ LIỆU (API CALLS)
    // =========================================================

    /**
     * Tải danh sách lịch thi từ API (READ)
     */
    public void loadExamSessions() {
        apiService.fetchAllExamsList()
                .thenAccept(apiResponse -> {
                    Platform.runLater(() -> {
                        if (apiResponse != null && "OK".equalsIgnoreCase(apiResponse.getMessage())) { // Sửa lại check
                                                                                                      // message cho an
                                                                                                      // toàn
                            examSessionList.setAll(apiResponse.getData());
                        } else {
                            // Nếu data rỗng hoặc lỗi logic từ backend
                            // Có thể backend trả về danh sách rỗng vẫn là OK, tùy logic
                            if (apiResponse != null && apiResponse.getData() != null) {
                                examSessionList.setAll(apiResponse.getData());
                            } else {
                                showAlert(Alert.AlertType.WARNING, "Thông báo", "Không có dữ liệu hoặc lỗi tải.");
                            }
                        }
                    });
                })
                .exceptionally(ex -> {
                    Platform.runLater(() -> showAlert(Alert.AlertType.ERROR, "Lỗi Kết Nối",
                            "Không thể kết nối đến Backend/Mockoon.\n" + ex.getMessage()));
                    return null;
                });
    }

    /**
     * Xử lý khi nhấn nút THÊM
     */
    @FXML
    private void handleAddButton(ActionEvent event) {
        try {
            // Đường dẫn phải chính xác tới file FXML của Form thêm mới
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/view/pages/LichThiPDTView.fxml"));
            Parent root = loader.load();

            // Lấy controller của form thêm mới để truyền tham chiếu (nếu cần reload lại
            // bảng sau khi thêm)
            // Lưu ý: Class LichThiPDTController cần có hàm setParentController
            Object controller = loader.getController();
            if (controller instanceof LichThiPDTController) {
                ((LichThiPDTController) controller).setParentController(this);
            }

            Stage formStage = new Stage();
            formStage.setTitle("Thêm Lịch Thi Mới (PĐT)");
            formStage.setScene(new Scene(root));
            formStage.show();

        } catch (IOException e) {
            e.printStackTrace();
            showAlert(Alert.AlertType.ERROR, "Lỗi", "Không thể mở Form Thêm Lịch Thi: " + e.getMessage());
        }
    }

    /**
     * Xử lý khi nhấn nút SỬA (UPDATE)
     */
    @FXML
    private void handleEditButton(ActionEvent event) {
        if (selectedSession == null)
            return;

        // 1. Tạo đối tượng cập nhật từ Form
        ExamSession updatedSession = new ExamSession();
        // ID giữ nguyên để backend biết đang sửa ai
        updatedSession.setMaCaThi(selectedSession.getMaCaThi());

        // Lấy thông tin mới từ TextField
        updatedSession.setMaHP(txtMaHocPhan.getText());
        updatedSession.setTenHP(txtTenHocPhan.getText());
        updatedSession.setLopSV(txtLopSV.getText());
        updatedSession.setNgayThi(txtNgayThi.getText());
        updatedSession.setGioThi(txtGioThi.getText());
        updatedSession.setPhongThi(txtPhongThi.getText());
        updatedSession.setSoSV(txtSoSV.getText());
        updatedSession.setHinhThucThi(txtHinhThucThi.getText());
        updatedSession.setCanBoCoiThi(txtCanBoCoiThi.getText());

        // Giữ lại các trường không hiển thị trên form (tránh gửi null)
        updatedSession.setSoBaiNop(selectedSession.getSoBaiNop());
        updatedSession.setSoMayTrong(selectedSession.getSoMayTrong());
        updatedSession.setTrangThai(selectedSession.getTrangThai());

        // 2. Gọi API
        apiService.updateExamSession(updatedSession)
                .thenRun(() -> Platform.runLater(() -> {
                    showAlert(Alert.AlertType.INFORMATION, "Thành công", "Đã cập nhật lịch thi.");
                    loadExamSessions(); // Load lại bảng
                    clearForm();
                }))
                .exceptionally(ex -> {
                    Platform.runLater(() -> showAlert(Alert.AlertType.ERROR, "Lỗi Cập Nhật", ex.getMessage()));
                    return null;
                });
    }

    /**
     * Xử lý khi nhấn nút XÓA (DELETE)
     */
    @FXML
    private void handleDeleteButton(ActionEvent event) {
        if (selectedSession == null)
            return;

        Alert confirm = new Alert(Alert.AlertType.CONFIRMATION);
        confirm.setTitle("Xác nhận xóa");
        confirm.setHeaderText("Bạn có chắc chắn muốn xóa lịch thi này?");
        confirm.setContentText("Mã ca thi: " + selectedSession.getMaCaThi() + "\nMôn: " + selectedSession.getTenHP());

        Optional<ButtonType> result = confirm.showAndWait();
        if (result.isPresent() && result.get() == ButtonType.OK) {
            apiService.deleteExamSession(selectedSession.getMaCaThi())
                    .thenRun(() -> Platform.runLater(() -> {
                        showAlert(Alert.AlertType.INFORMATION, "Thành công", "Đã xóa lịch thi.");
                        loadExamSessions(); // Load lại bảng
                        clearForm();
                    }))
                    .exceptionally(ex -> {
                        Platform.runLater(() -> showAlert(Alert.AlertType.ERROR, "Lỗi Xóa", ex.getMessage()));
                        return null;
                    });
        }
    }

    // =========================================================
    // CÁC HÀM TIỆN ÍCH (HELPER METHODS)
    // =========================================================

    private void fillFormWithDetails(ExamSession session) {
        if (session == null)
            return;
        txtMaHocPhan.setText(session.getMaHP());
        txtTenHocPhan.setText(session.getTenHP());
        txtLopSV.setText(session.getLopSV());
        txtNgayThi.setText(session.getNgayThi());
        txtGioThi.setText(session.getGioThi());
        txtPhongThi.setText(session.getPhongThi());
        txtSoSV.setText(session.getSoSV());
        txtHinhThucThi.setText(session.getHinhThucThi());
        txtCanBoCoiThi.setText(session.getCanBoCoiThi());
    }

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
        selectedSession = null;
    }

    private void showAlert(Alert.AlertType type, String title, String content) {
        Alert alert = new Alert(type);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(content);
        alert.showAndWait();
    }
}