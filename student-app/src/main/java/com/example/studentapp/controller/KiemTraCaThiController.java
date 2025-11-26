package com.example.studentapp.controller;

// --- THÊM IMPORT CẦN THIẾT CHO VIỆC TẢI FXML ---
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;
// -----------------------------------------------

import javafx.scene.control.Button;
import javafx.util.Callback;
import javafx.scene.control.TableCell;
import javafx.event.ActionEvent;

import com.example.studentapp.model.ApiResponse;
import com.example.studentapp.model.ExamSession;
import com.example.studentapp.service.ApiService;
import javafx.application.Platform;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.Alert;
import javafx.scene.control.ProgressIndicator;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.TextField;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.control.cell.TextFieldTableCell;

// Import thêm các thư viện để GHI FILE
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import javafx.stage.FileChooser;

import java.net.URL;
import java.util.List;
import java.util.ResourceBundle;
import java.util.concurrent.CompletableFuture;

public class KiemTraCaThiController implements Initializable {

    @FXML
    private TableView<ExamSession> tableView;
    @FXML
    private TableColumn<ExamSession, String> colMaCaThi;
    @FXML
    private TableColumn<ExamSession, String> colTenMonHoc;
    @FXML
    private TableColumn<ExamSession, String> colPhongThi;
    @FXML
    private TableColumn<ExamSession, String> colNgayThi;
    @FXML
    private TableColumn<ExamSession, String> colGioThi;
    @FXML
    private TableColumn<ExamSession, String> colTrangThai;
    @FXML
    private ProgressIndicator loadingIndicator;
    @FXML
    private TextField roomFilterField;
    @FXML
    private TableColumn<ExamSession, Integer> colSoBaiNop;
    @FXML
    private TableColumn<ExamSession, Integer> colSoMayTrong;
    @FXML
    private TableColumn<ExamSession, String> colCanBoCoiThi;

    @FXML
    private TableColumn<ExamSession, Void> colBienBan;

    // --- THÊM BIẾN @FXML MỚI (UPLOAD) ---
    @FXML
    private TableColumn<ExamSession, Void> colUpload;
    // ---------------------------------------

    private ApiService apiService;
    private ObservableList<ExamSession> examSessionList;

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        apiService = new ApiService();
        examSessionList = FXCollections.observableArrayList();
        tableView.setEditable(true);

        setupTableColumns();
        setupBienBanColumn();
        setupUploadColumn();

        loadExamSessions();
    }

    /**
     * Cấu hình các cột TableView
     */
    private void setupTableColumns() {
        colMaCaThi.setCellValueFactory(new PropertyValueFactory<>("maCaThi"));
        colTenMonHoc.setCellValueFactory(new PropertyValueFactory<>("tenMonHoc"));
        colPhongThi.setCellValueFactory(new PropertyValueFactory<>("phongThi"));
        colNgayThi.setCellValueFactory(new PropertyValueFactory<>("ngayThi"));
        colGioThi.setCellValueFactory(new PropertyValueFactory<>("gioThi"));
        colTrangThai.setCellValueFactory(new PropertyValueFactory<>("trangThai"));
        colSoBaiNop.setCellValueFactory(new PropertyValueFactory<>("soBaiNop"));
        colSoMayTrong.setCellValueFactory(new PropertyValueFactory<>("soMayTrong"));

        // --- Cấu hình cột "Cán bộ coi thi" ---
        colCanBoCoiThi.setCellValueFactory(new PropertyValueFactory<>("canBoCoiThi"));
        colCanBoCoiThi.setCellFactory(TextFieldTableCell.forTableColumn());
        colCanBoCoiThi.setOnEditCommit(event -> {
            ExamSession session = event.getRowValue();
            String maCaThi = session.getMaCaThi();
            String tenCu = event.getOldValue();
            String tenMoi = event.getNewValue();

            session.setCanBoCoiThi(tenMoi);

            apiService.updateProctor(maCaThi, tenMoi)
                    .exceptionally(ex -> {
                        Platform.runLater(() -> {
                            showAlert("Lỗi Cập Nhật", "Không thể lưu CBCT: " + ex.getMessage());
                            session.setCanBoCoiThi(tenCu);
                            tableView.refresh();
                        });
                        return null;
                    });
        });

        tableView.setItems(examSessionList);
    }

    private void loadExamSessions() {
        setLoading(true);

        // --- [SỬA ĐOẠN NÀY] Thêm List<...> vào ---
        CompletableFuture<ApiResponse<List<ExamSession>>> future = apiService.fetchAllExamsList();

        future.whenComplete((apiResponse, throwable) -> {
            Platform.runLater(() -> {
                setLoading(false);
                if (throwable != null) {
                    showAlert("Lỗi Kết Nối", "Không thể tải dữ liệu: " + throwable.getMessage());
                } else if (apiResponse != null && "OK".equals(apiResponse.getMessage())) {
                    examSessionList.setAll(apiResponse.getData());

                    // Giờ data là List nên hàm isEmpty() sẽ chạy đúng
                    if (apiResponse.getData().isEmpty()) {
                        showAlert("Thông báo", "Không có ca thi nào cho hôm nay.");
                    }
                } else {
                    showAlert("Lỗi API",
                            "API trả về lỗi: " + (apiResponse != null ? apiResponse.getMessage() : "Null response"));
                }
            });
        });
    }

    @FXML
    private void handleRefreshButton() {
        roomFilterField.clear();
        loadExamSessions();
    }

    @FXML
    private void handleFilterButton() {
        String roomName = roomFilterField.getText();
        if (roomName == null || roomName.trim().isEmpty()) {
            loadExamSessions();
        } else {
            loadExamsByRoom(roomName.trim());
        }
    }

    private void loadExamsByRoom(String roomName) {
        setLoading(true);

        // [SỬA Ở ĐÂY]: Thêm List<...> vào bên trong ApiResponse
        CompletableFuture<ApiResponse<List<ExamSession>>> future = apiService.fetchExamsByRoomList(roomName);

        future.whenComplete((apiResponse, throwable) -> {
            Platform.runLater(() -> {
                setLoading(false);
                if (throwable != null) {
                    showAlert("Lỗi Kết Nối", "Không thể tải dữ liệu: " + throwable.getMessage());
                } else if (apiResponse != null && "OK".equals(apiResponse.getMessage())) {
                    examSessionList.setAll(apiResponse.getData());

                    // [HẾT LỖI]: Vì data là List nên hàm isEmpty() sẽ hoạt động
                    if (apiResponse.getData().isEmpty()) {
                        showAlert("Thông báo", "Không tìm thấy ca thi nào cho phòng '" + roomName + "'.");
                    }
                } else {
                    showAlert("Lỗi API",
                            "API trả về lỗi: " + (apiResponse != null ? apiResponse.getMessage() : "Null response"));
                }
            });
        });
    }

    // --- XỬ LÝ CỘT XUẤT FILE CSV ---
    @FXML
    private void handleExportButton() {
        List<ExamSession> dataToExport = examSessionList;

        if (dataToExport.isEmpty()) {
            showAlert("Thông báo", "Không có dữ liệu để xuất.");
            return;
        }

        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Lưu Báo Cáo");
        fileChooser.setInitialFileName("BaoCaoCaThi_" + java.time.LocalDate.now() + ".csv");
        fileChooser.getExtensionFilters().add(new FileChooser.ExtensionFilter("CSV Files", "*.csv"));

        File file = fileChooser.showSaveDialog(tableView.getScene().getWindow());

        if (file != null) {
            try (FileWriter writer = new FileWriter(file, java.nio.charset.StandardCharsets.UTF_8)) {

                writer.append('\uFEFF');
                writer.append(
                        "Mã Ca Thi,Tên Môn Học,Phòng Thi,Ngày Thi,Giờ Thi,Trạng Thái,Cán bộ coi thi,Số Bài Nộp,Số Máy Trống\n");

                for (ExamSession session : dataToExport) {
                    writer.append(escapeCsv(session.getMaCaThi()));
                    writer.append(',');
                    writer.append(escapeCsv(session.getTenMonHoc()));
                    writer.append(',');
                    writer.append(escapeCsv(session.getPhongThi()));
                    writer.append(',');
                    writer.append(escapeCsv(session.getNgayThi()));
                    writer.append(',');
                    writer.append(escapeCsv(session.getGioThi()));
                    writer.append(',');
                    writer.append(escapeCsv(session.getTrangThai()));
                    writer.append(',');
                    writer.append(escapeCsv(session.getCanBoCoiThi()));
                    writer.append(',');
                    writer.append(String.valueOf(session.getSoBaiNop()));
                    writer.append(',');
                    writer.append(String.valueOf(session.getSoMayTrong()));
                    writer.append('\n');
                }

                showAlert("Thành công", "Xuất file báo cáo thành công!");

            } catch (IOException e) {
                showAlert("Lỗi Ghi File", "Không thể lưu file: " + e.getMessage());
            }
        }
    }

    private String escapeCsv(String value) {
        if (value == null) {
            return "\"\"";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return "\"" + value + "\"";
    }

    private void setLoading(boolean isLoading) {
        loadingIndicator.setVisible(isLoading);
        tableView.setVisible(!isLoading);
    }

    private void showAlert(String title, String content) {
        Alert.AlertType alertType = title.toLowerCase().contains("lỗi") ? Alert.AlertType.ERROR
                : Alert.AlertType.INFORMATION;

        Alert alert = new Alert(alertType);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(content);
        alert.showAndWait();
    }

    // --- CÁC HÀM XUẤT BIÊN BẢN (TXT) ---

    /**
     * Thêm các nút "Xuất" vào cột "Biên bản"
     */
    private void setupBienBanColumn() {
        Callback<TableColumn<ExamSession, Void>, TableCell<ExamSession, Void>> cellFactory = new Callback<>() {
            @Override
            public TableCell<ExamSession, Void> call(final TableColumn<ExamSession, Void> param) {
                final TableCell<ExamSession, Void> cell = new TableCell<>() {
                    private final Button btn = new Button("Xuất");
                    {
                        btn.setOnAction((ActionEvent event) -> {
                            ExamSession session = getTableView().getItems().get(getIndex());
                            exportBienBan(session);
                        });
                    }

                    @Override
                    public void updateItem(Void item, boolean empty) {
                        super.updateItem(item, empty);
                        if (empty) {
                            setGraphic(null);
                        } else {
                            setGraphic(btn);
                        }
                    }
                };
                return cell;
            }
        };

        colBienBan.setCellFactory(cellFactory);
    }

    /**
     * Xử lý việc ghi file .txt cho một ca thi
     */
    private void exportBienBan(ExamSession session) {
        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Lưu Biên Bản Coi Thi");
        fileChooser.setInitialFileName("BienBan_" + session.getMaCaThi() + ".txt");
        fileChooser.getExtensionFilters().add(new FileChooser.ExtensionFilter("Text Files", "*.txt"));

        File file = fileChooser.showSaveDialog(tableView.getScene().getWindow());

        if (file != null) {
            try (FileWriter writer = new FileWriter(file, java.nio.charset.StandardCharsets.UTF_8)) {

                writer.append('\uFEFF');
                writer.append("BIÊN BẢN COI THI\n");
                writer.append("============================\n\n");
                writer.append(String.format("%-15s: %s\n", "Môn thi", session.getTenMonHoc()));
                writer.append(String.format("%-15s: %s\n", "Mã ca thi", session.getMaCaThi()));
                writer.append(String.format("%-15s: %s\n", "Phòng thi", session.getPhongThi()));
                writer.append(String.format("%-15s: %s\n", "Ngày thi", session.getNgayThi()));
                writer.append(String.format("%-15s: %s\n", "Giờ thi", session.getGioThi()));
                writer.append(String.format("%-15s: %s\n", "Cán bộ coi thi", session.getCanBoCoiThi()));
                writer.append("\n----------------------------\n\n");
                writer.append(String.format("%-15s: %s\n", "Trạng thái", session.getTrangThai()));
                writer.append(String.format("%-15s: %d\n", "Số bài đã nộp", session.getSoBaiNop()));
                writer.append(String.format("%-15s: %d\n", "Số máy trống", session.getSoMayTrong()));

                writer.append("\n\n\n");
                writer.append("     Xác nhận của CBCT:\n\n\n");
                writer.append("     .........................\n");
                writer.append("     (Ký và ghi rõ họ tên)\n");

                showAlert("Thành công", "Xuất biên bản cho ca thi " + session.getMaCaThi() + " thành công!");

            } catch (IOException e) {
                showAlert("Lỗi Ghi File", "Không thể lưu file: " + e.getMessage());
            }
        }
    }

    // --- CÁC HÀM MỚI CHO UPLOAD FILE (NỘP BÀI) ---

    /**
     * Thêm nút "Upload" vào cột "Nộp Bài"
     */
    private void setupUploadColumn() {
        Callback<TableColumn<ExamSession, Void>, TableCell<ExamSession, Void>> cellFactory = new Callback<>() {
            @Override
            public TableCell<ExamSession, Void> call(final TableColumn<ExamSession, Void> param) {
                final TableCell<ExamSession, Void> cell = new TableCell<>() {
                    private final Button btn = new Button("Upload");
                    {
                        btn.setStyle("-fx-background-color: #0078D7; -fx-text-fill: white;");
                        btn.setOnAction((ActionEvent event) -> {
                            ExamSession session = getTableView().getItems().get(getIndex());
                            openUploadForm(session);
                        });
                    }

                    @Override
                    public void updateItem(Void item, boolean empty) {
                        super.updateItem(item, empty);
                        if (empty) {
                            setGraphic(null);
                        } else {
                            setGraphic(btn);
                        }
                    }
                };
                return cell;
            }
        };
        colUpload.setCellFactory(cellFactory);
    }

    /**
     * Hàm mở cửa sổ Upload
     */
    private void openUploadForm(ExamSession session) {
        try {
            // ĐÃ SỬA ĐƯỜNG DẪN ĐÚNG: /view/upload-view.fxml
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/view/upload-view.fxml"));
            Parent root = loader.load();

            // Truyền thông tin Ca thi (session) vào UploadController
            UploadController uploadController = loader.getController();
            uploadController.setExamSession(session);

            Stage uploadStage = new Stage();
            uploadStage.setTitle("Nộp bài thi - " + session.getMaCaThi());
            uploadStage.setScene(new Scene(root));
            uploadStage.show();

        } catch (IOException e) {
            e.printStackTrace();
            showAlert("Lỗi", "Không thể mở Form Upload. Kiểm tra file upload-view.fxml");
        }
    }

    // --- KẾT THÚC CÁC HÀM MỚI ---

    // ... (Các hàm thoát, showAlert, v.v. được đặt ở đây)
}