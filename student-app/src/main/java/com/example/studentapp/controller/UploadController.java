package com.example.studentapp.controller;

import com.example.studentapp.model.ExamSession;
import com.example.studentapp.service.ApiService; // Sử dụng API Service mới
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.scene.control.Alert;
import javafx.scene.control.Button; // Thêm import Button
import javafx.scene.control.Label;
import javafx.stage.FileChooser;
import javafx.stage.Stage;

import java.io.File;
import java.io.IOException;

// Thêm import cho Button và Alert nếu chưa có
import javafx.scene.control.Alert.AlertType;


public class UploadController {
    
    // Giả định FXML của bạn có 3 nút:
    @FXML private Label fileLabel;
    @FXML private Label statusLabel;
    @FXML private Button btnChooseFile; // Cần thêm fx:id vào FXML: <Button fx:id="btnChooseFile" onAction="#chooseFile" text="Chọn file" />
    @FXML private Button btnUpload;     // Cần thêm fx:id vào FXML: <Button fx:id="btnUpload" onAction="#uploadFile" text="Nộp bài" />

    private ApiService apiService;
    private ExamSession session; // Biến lưu Ca Thi được truyền từ màn hình chính
    private File selectedFile;

    public UploadController() {
        this.apiService = new ApiService();
    }
    
    // --- THÊM HÀM NHẬN DỮ LIỆU CA THI ---
    public void setExamSession(ExamSession session) {
        this.session = session;
        statusLabel.setText("Sẵn sàng nộp bài cho ca: " + session.getMaCaThi());
        if (btnUpload != null) {
            btnUpload.setDisable(true); // Vô hiệu hóa nút nộp bài ban đầu
        }
    }
    // ------------------------------------

    @FXML
    private void chooseFile() {
        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Chọn file bài thi");
        
        // Sửa lỗi: Lấy Stage (cửa sổ) từ nút Chọn File, không tạo Stage mới
        Stage stage = (Stage) (btnChooseFile != null ? btnChooseFile.getScene().getWindow() : new Stage());
        
        selectedFile = fileChooser.showOpenDialog(stage);
        
        if (selectedFile != null) {
            fileLabel.setText("Đã chọn: " + selectedFile.getName());
            if (btnUpload != null) {
                btnUpload.setDisable(false);
            }
        } else {
            fileLabel.setText("Chưa chọn file nào...");
            if (btnUpload != null) {
                btnUpload.setDisable(true);
            }
        }
    }

    @FXML
    private void uploadFile() {
        if (selectedFile == null || session == null) {
            showAlert(AlertType.ERROR, "Lỗi", "Vui lòng chọn file và đảm bảo ca thi hợp lệ.");
            return;
        }

        // Ẩn nút và hiện trạng thái tải
        btnUpload.setDisable(true);
        btnChooseFile.setDisable(true);
        statusLabel.setText("Đang tải lên... Vui lòng chờ.");

        // 🚀 GỌI API UPLOAD MỚI 🚀
        apiService.uploadFile(session.getMaCaThi(), selectedFile)
            .thenRun(() -> Platform.runLater(() -> {
                // Upload thành công
                showAlert(AlertType.INFORMATION, "Thành công", "Bài nộp cho ca thi " + session.getMaCaThi() + " đã được tải lên.");
                
                // Đóng cửa sổ
                ((Stage) btnUpload.getScene().getWindow()).close();
            }))
            .exceptionally(ex -> {
                // Xử lý lỗi
                Platform.runLater(() -> {
                    showAlert(AlertType.ERROR, "Lỗi Upload", "Tải file thất bại: " + ex.getMessage());
                    statusLabel.setText("Tải lên thất bại.");
                    btnUpload.setDisable(false);
                    btnChooseFile.setDisable(false);
                });
                return null;
            });
    }

    private void showAlert(AlertType alertType, String title, String content) {
        Alert alert = new Alert(alertType);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(content);
        alert.showAndWait();
    }
}