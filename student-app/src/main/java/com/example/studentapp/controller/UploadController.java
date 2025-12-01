package com.example.studentapp.controller;

import com.example.studentapp.model.ExamSession;
import com.example.studentapp.service.ApiService; // [Cập nhật] Import Service chính
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.scene.control.Alert;
import javafx.scene.control.Alert.AlertType;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.stage.FileChooser;
import javafx.stage.Stage;

import java.io.File;

public class UploadController {

    // --- CÁC BIẾN FXML (Đảm bảo file .fxml có fx:id tương ứng) ---
    @FXML
    private Label fileLabel;
    @FXML
    private Label statusLabel;

    // [THÊM TỪ TXT] Thêm nút bấm để xử lý disable/enable
    @FXML
    private Button btnChooseFile;
    @FXML
    private Button btnUpload;

    // --- CÁC BIẾN DỮ LIỆU ---
    private ApiService apiService; // [THÊM TỪ TXT]
    private ExamSession session; // [THÊM TỪ TXT] Biến lưu Ca Thi
    private File selectedFile;

    // [THÊM TỪ TXT] Hàm khởi tạo
    public UploadController() {
        this.apiService = new ApiService();
    }

    // [THÊM TỪ TXT] Hàm nhận dữ liệu Ca Thi từ màn hình chính
    public void setExamSession(ExamSession session) {
        this.session = session;
        // Hiển thị thông tin ca thi nếu có
        if (session != null) {
            statusLabel.setText("Sẵn sàng nộp bài cho ca: " + session.getMaCaThi());
        }

        // Vô hiệu hóa nút nộp bài khi chưa chọn file
        if (btnUpload != null) {
            btnUpload.setDisable(true);
        }
    }

    @FXML
    private void chooseFile() {
        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Chọn file bài thi");

        // [CẬP NHẬT TỪ TXT] Lấy Stage từ nút bấm (tránh tạo stage rác)
        Stage stage = (Stage) (btnChooseFile != null ? btnChooseFile.getScene().getWindow() : new Stage());
        selectedFile = fileChooser.showOpenDialog(stage);

        if (selectedFile != null) {
            fileLabel.setText("Đã chọn: " + selectedFile.getName());
            // [THÊM TỪ TXT] Bật nút upload khi đã có file
            if (btnUpload != null) {
                btnUpload.setDisable(false);
            }
        } else {
            fileLabel.setText("Chưa chọn file nào...");
            // [THÊM TỪ TXT] Tắt nút upload nếu hủy chọn
            if (btnUpload != null) {
                btnUpload.setDisable(true);
            }
        }
    }

    @FXML
    private void uploadFile() {
        // [CẬP NHẬT TỪ TXT] Kiểm tra kỹ hơn
        if (selectedFile == null || session == null) {
            showAlert(AlertType.ERROR, "Lỗi", "Vui lòng chọn file và đảm bảo ca thi hợp lệ.");
            return;
        }

        // [THÊM TỪ TXT] Ẩn nút và hiện trạng thái tải để tránh bấm nhiều lần
        if (btnUpload != null)
            btnUpload.setDisable(true);
        if (btnChooseFile != null)
            btnChooseFile.setDisable(true);
        statusLabel.setText("Đang tải lên... Vui lòng chờ.");

        // [QUAN TRỌNG] GỌI API UPLOAD MỚI (Async)
        // Lưu ý: Đảm bảo hàm uploadExamCollection trong ApiService khớp tham số
        // Ở đây mình giả định bạn gọi hàm uploadExamCollection

        // Ví dụ gọi: apiService.uploadExamCollection(file, id, room, time, count,
        // cbct1, cbct2, note)
        // Bạn cần truyền đúng các tham số lấy từ `session` vào đây.
        // Dưới đây là code mẫu theo logic của file txt (gọi hàm uploadFile):

        apiService.uploadExamCollection(
                selectedFile,
                Integer.parseInt(session.getMaCaThi()), // Giả sử mã ca thi là ID (int)
                session.getPhongThi(), // Lấy phòng
                session.getGioThi(), // Lấy giờ
                0, // Số SV (nếu có thì get)
                "", // CBCT 1
                "", // CBCT 2
                "" // Ghi chú
        )
                .thenRun(() -> Platform.runLater(() -> {
                    // [THÊM TỪ TXT] Upload thành công
                    showAlert(AlertType.INFORMATION, "Thành công",
                            "Bài nộp cho ca thi " + session.getMaCaThi() + " đã được tải lên.");

                    // Đóng cửa sổ sau khi nộp xong
                    if (btnUpload != null) {
                        ((Stage) btnUpload.getScene().getWindow()).close();
                    }
                }))
                .exceptionally(ex -> {
                    // [THÊM TỪ TXT] Xử lý lỗi
                    Platform.runLater(() -> {
                        ex.printStackTrace();
                        showAlert(AlertType.ERROR, "Lỗi Upload", "Tải file thất bại: " + ex.getMessage());
                        statusLabel.setText("Tải lên thất bại.");

                        // Mở lại nút để thử lại
                        if (btnUpload != null)
                            btnUpload.setDisable(false);
                        if (btnChooseFile != null)
                            btnChooseFile.setDisable(false);
                    });
                    return null;
                });
    }

    // [THÊM TỪ TXT] Hàm hiển thị thông báo
    private void showAlert(AlertType alertType, String title, String content) {
        Alert alert = new Alert(alertType);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(content);
        alert.showAndWait();
    }
}