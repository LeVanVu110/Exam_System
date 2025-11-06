package com.example.studentapp.controller;

import com.example.studentapp.model.RoomDetailResponse;
import com.example.studentapp.model.RoomModel;
import com.example.studentapp.service.ApiService;
import javafx.application.Platform;
import javafx.beans.binding.Bindings;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.layout.ColumnConstraints;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.Priority;
import javafx.util.Pair;
import javafx.concurrent.Task;
import javafx.stage.StageStyle;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import java.util.Optional;
import java.util.function.UnaryOperator;
import java.util.regex.Pattern;


public class ExamRoomDetailController {

    @FXML
    private Label lblTitle;
    @FXML
    private Label lblShowGioThi;
    @FXML
    private Button btnBack;
    @FXML
    private Label lblTenHP;
    @FXML
    private Label lblLopHP;
    @FXML
    private Label lblSoTC;
    @FXML
    private Label lblSoSV;
    @FXML
    private Label lblNgayThi;
    @FXML
    private Label lblGioThi;
    @FXML
    private Label lblTGThi;
    @FXML
    private Label lblRoom;
    @FXML
    private Label lblCBCT1;
    @FXML
    private Label lblCBCT2;
    @FXML
    private Button btnThayDoiCBCT;
    @FXML
    private TextField txtSoLuongMay;
    @FXML
    private TextField txtSoLuongSV;
    @FXML
    private TextArea txtGhiChu;
    @FXML
    private Button btnXuLyThuBai;
    @FXML
    private Button btnKiemTra;

    private MainController mainController;
    private final ApiService apiService = new ApiService();
    private RoomModel currentRoom;

    public void setMainController(MainController mainController) {
        this.mainController = mainController;
    }

    public void loadExamDetail(int examSessionId) {
        apiService.fetchExamById(examSessionId).thenAccept(response -> {
            Platform.runLater(() -> updateUiWithResponse(response));
        }).exceptionally(e -> {
            Platform.runLater(() -> System.out.println("Lỗi tải dữ liệu chi tiết ca thi: " + e.getMessage()));
            return null;
        });

    }

    private void updateUiWithResponse(RoomDetailResponse response) {
        RoomModel room = response.getData();

        this.currentRoom = room;

        btnBack.setOnAction(this::handleBack);
        btnThayDoiCBCT.setOnAction(this::handleShowForm);
        btnKiemTra.setOnAction(this::handleKiemTra);

        validationNumber(txtSoLuongMay, 100);
        validationNumber(txtSoLuongSV, 200);
        setupCharacterLimit(txtGhiChu, 500);

        // Đổ dữ liệu từ RoomModel vào các Label
        lblTitle.setText("Chi Tiết Ca Thi Phòng " + room.roomProperty().get());
        lblShowGioThi.setText("Ca Thi: " + room.gioThiProperty().get());
        lblTenHP.setText(room.tenHPProperty().get());
        lblLopHP.setText(room.lopHPProperty().get());
        lblSoTC.setText(room.soTCProperty().get());
        lblSoSV.setText(room.soSVProperty().get());
        lblNgayThi.setText(room.ngayThiProperty().get());
        lblGioThi.setText(room.gioThiProperty().get());
        lblTGThi.setText(room.tgThiProperty().get());
        lblRoom.setText(room.roomProperty().get());

        lblCBCT1.textProperty().bind(Bindings.concat("• ", room.cbct1Property()));
        lblCBCT2.textProperty().bind(Bindings.concat("• ", room.cbct2Property()));
        lblCBCT1.visibleProperty().bind(room.cbct1Property().isNotEmpty());
        lblCBCT2.visibleProperty().bind(room.cbct2Property().isNotEmpty());
        lblCBCT1.managedProperty().bind(lblCBCT1.visibleProperty());
        lblCBCT2.managedProperty().bind(lblCBCT2.visibleProperty());

        txtSoLuongMay.setText("50");
    }

    private void validationNumber(TextField textField, int maxValue) {
        Pattern pattern = Pattern.compile("\\d*");
        UnaryOperator<TextFormatter.Change> filter = change -> {
            String newText = change.getControlNewText();
            if (pattern.matcher(newText).matches()) {
                return change;
            }
            return null;
        };
        TextFormatter<String> textFormatter = new TextFormatter<>(filter);
        textField.setTextFormatter(textFormatter);

        textField.textProperty().addListener((observable, oldValue, newValue) -> {
            if (newValue != null && !newValue.isEmpty()) {
                try {
                    int value = Integer.parseInt(newValue);

                    if (value > maxValue) {
                        Platform.runLater(() -> {
                            Alert alert = new Alert(Alert.AlertType.WARNING);
                            alert.setTitle("Giá trị không hợp lệ");
                            alert.setHeaderText(null);
                            alert.setContentText("Giá trị nhập vào không được vượt quá " + maxValue + ".");
                            alert.showAndWait();

                            textField.setText(oldValue);
                        });
                    }
                } catch (NumberFormatException e) {
                    Platform.runLater(() -> textField.setText(oldValue));
                }
            }
        });
    }

    private void setupCharacterLimit(TextArea textArea, int maxChars) {

        textArea.textProperty().addListener((observable, oldValue, newValue) -> {

            if (newValue != null && newValue.length() > maxChars) {

                Platform.runLater(() -> {
                    // 1. Hiển thị thông báo lỗi
                    Alert alert = new Alert(Alert.AlertType.WARNING);
                    alert.setTitle("Vượt quá giới hạn ký tự");
                    alert.setHeaderText(null);
                    alert.setContentText("Ghi chú không được vượt quá " + maxChars + " ký tự.");
                    alert.showAndWait();

                    // 2. Khôi phục text về giá trị cũ (trước khi gõ/dán quá)
                    textArea.setText(oldValue);
                });
            }
        });
    }

    @FXML
    void handleBack(ActionEvent event) {
        // "Nhờ" cha chuyển về trang danh sách
        if (mainController != null) {
            mainController.showExamListPage();
        }
    }

    @FXML
    void handleShowForm(ActionEvent event) {

        if (this.currentRoom == null) {
            System.out.println("Lỗi: currentRoom là null, không thể mở dialog.");
            return;
        }

        Dialog<Pair<String, String>> dialog = new Dialog<>();
        dialog.setTitle("Thay đổi Cán bộ coi thi");
        dialog.setHeaderText("Nhập tên cán bộ coi thi mới cho phòng" + this.currentRoom.roomProperty().get());

        ButtonType saveButtonType = new ButtonType("Lưu", ButtonBar.ButtonData.OK_DONE);
        dialog.getDialogPane().getButtonTypes().addAll(saveButtonType, ButtonType.CANCEL);

        GridPane grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(10);

        grid.setPadding(new Insets(20, 20, 20, 20));

        ColumnConstraints col1 = new ColumnConstraints();
        ColumnConstraints col2 = new ColumnConstraints();
        col2.setHgrow(Priority.ALWAYS);
        grid.getColumnConstraints().addAll(col1, col2);

        TextField txtCbct1 = new TextField();
        txtCbct1.setPromptText("Tên CBCT 1");
        txtCbct1.setText(this.currentRoom.cbct1Property().get());

        TextField txtCbct2 = new TextField();
        txtCbct2.setPromptText("Tên CBCT 2");
        txtCbct2.setText(this.currentRoom.cbct2Property().get());

        grid.add(new Label("CBCT 1:"), 0, 0);
        grid.add(txtCbct1, 1, 0);
        grid.add(new Label("CBCT 2:"), 0, 1);
        grid.add(txtCbct2, 1, 1);

        dialog.getDialogPane().setPrefWidth(450);
        dialog.getDialogPane().setContent(grid);

        Platform.runLater(txtCbct1::requestFocus);

        dialog.setResultConverter(dialogButton -> {
            if (dialogButton == saveButtonType) {
                return new Pair<>(txtCbct1.getText(), txtCbct2.getText());
            }
            return null;
        });

        Optional<Pair<String, String>> result = dialog.showAndWait();

        result.ifPresent(newNames -> {
            String newCbct1 = newNames.getKey();
            String newCbct2 = newNames.getValue();

            this.currentRoom.cbct1Property().set(newCbct1);
            this.currentRoom.cbct2Property().set(newCbct2);

        });
    }

    @FXML
    void handleKiemTra(ActionEvent event) {
        // Lấy giá trị expected trước khi chạy background để tránh truy cập UI từ thread khác
        final String baseDrive = "G:\\"; // hoặc lấy từ config nếu muốn
        final int totalMachines;
        final int expectedStudents;

        // Lấy giá trị người dùng nhập
        try {
            totalMachines = Integer.parseInt(txtSoLuongMay.getText().trim());
        } catch (NumberFormatException ex) {
            showAlertOnUIThread("Giá trị số lượng máy không hợp lệ: " + txtSoLuongMay.getText(), Alert.AlertType.ERROR);
            return;
        }

        try {
            expectedStudents = Integer.parseInt(txtSoLuongSV.getText().trim());
        } catch (NumberFormatException ex) {
            showAlertOnUIThread("Giá trị số lượng sinh viên không hợp lệ: " + txtSoLuongSV.getText(), Alert.AlertType.ERROR);
            return;
        }

        // Chạy kiểm tra trên background thread
        CompletableFuture.runAsync(() -> {
            StringBuilder report = new StringBuilder();
            int totalStudentFoldersFound = 0;

            List<String> machinesWithStudent = new ArrayList<>();
            List<String> machinesWithoutStudent = new ArrayList<>();
            List<String> machinesMultipleStudents = new ArrayList<>();
            List<String> studentWithTxt = new ArrayList<>();
            List<String> studentWithoutTxt = new ArrayList<>();
            List<String> missingMachineFolder = new ArrayList<>();

            for (int i = 1; i <= totalMachines; i++) {
                String machineName = "May" + i;
                File machineDir = new File(baseDrive + machineName);

                if (!machineDir.exists() || !machineDir.isDirectory()) {
                    missingMachineFolder.add(machineName + " (thư mục máy bị thiếu)");
                    machinesWithoutStudent.add(machineName + " (missing)");
                    continue;
                }

                File[] studentFolders = machineDir.listFiles(File::isDirectory);

                if (studentFolders == null || studentFolders.length == 0) {
                    machinesWithoutStudent.add(machineName);
                } else if (studentFolders.length == 1) {
                    File studentFolder = studentFolders[0];
                    machinesWithStudent.add(machineName + " -> " + studentFolder.getName());
                    totalStudentFoldersFound += 1;

                    File[] txtFiles = studentFolder.listFiles((d, name) -> name.toLowerCase().endsWith(".txt"));
                    if (txtFiles != null && txtFiles.length > 0) {
                        studentWithTxt.add(machineName + " -> " + studentFolder.getName());
                    } else {
                        studentWithoutTxt.add(machineName + " -> " + studentFolder.getName());
                    }
                } else { // nhiều hơn 1 folder: vi phạm "mỗi máy chỉ được 1 thư mục sinh viên"
                    String names = Arrays.stream(studentFolders).map(File::getName).collect(Collectors.joining(", "));
                    machinesMultipleStudents.add(machineName + " -> [" + names + "]");
                    totalStudentFoldersFound += studentFolders.length;

                    // vẫn kiểm tra trong từng folder con xem có .txt không
                    for (File sf : studentFolders) {
                        File[] txtFiles = sf.listFiles((d, name) -> name.toLowerCase().endsWith(".txt"));
                        if (txtFiles != null && txtFiles.length > 0) {
                            studentWithTxt.add(machineName + " -> " + sf.getName());
                        } else {
                            studentWithoutTxt.add(machineName + " -> " + sf.getName());
                        }
                    }
                }
            }

            // Tổng kết
            report.append("🔍 KẾT QUẢ KIỂM TRA Ổ ĐĨA " + baseDrive + " (May1..May50)\n\n");
            report.append("Tổng folder sinh viên tìm thấy: ").append(totalStudentFoldersFound).append("\n");
            report.append("Số lượng sinh viên dự kiến (txtSoLuongSV): ").append(expectedStudents).append("\n\n");

            if (totalStudentFoldersFound == expectedStudents) {
                report.append("✅ Số lượng folder KHỚP.\n\n");
            } else {
                report.append("⚠️ Số lượng folder KHÔNG khớp.\n\n");
            }

            report.append("---- Máy có 1 thư mục sinh viên ----\n");
            if (machinesWithStudent.isEmpty()) {
                report.append("  (Không có máy nào)\n");
            } else {
                machinesWithStudent.forEach(s -> report.append("  - ").append(s).append("\n"));
            }
            report.append("\n");

            report.append("---- Máy KHÔNG có thư mục sinh viên ----\n");
            if (machinesWithoutStudent.isEmpty()) {
                report.append("  (Không có máy nào)\n");
            } else {
                machinesWithoutStudent.forEach(s -> report.append("  - ").append(s).append("\n"));
            }
            report.append("\n");

            if (!missingMachineFolder.isEmpty()) {
                report.append("---- Máy bị thiếu thư mục MayX trên G:\\ ----\n");
                missingMachineFolder.forEach(s -> report.append("  - ").append(s).append("\n"));
                report.append("\n");
            }

            report.append("---- Máy có NHIỀU hơn 1 thư mục (vi phạm) ----\n");
            if (machinesMultipleStudents.isEmpty()) {
                report.append("  (Không có máy vi phạm)\n");
            } else {
                machinesMultipleStudents.forEach(s -> report.append("  - ").append(s).append("\n"));
            }
            report.append("\n");

            report.append("---- Danh sách đã nộp (.txt tìm thấy trong folder sinh viên) ----\n");
            if (studentWithTxt.isEmpty()) {
                report.append("  (Không có)\n");
            } else {
                studentWithTxt.forEach(s -> report.append("  - ").append(s).append("\n"));
            }
            report.append("\n");

            report.append("---- Danh sách CHƯA nộp (không thấy file .txt) ----\n");
            if (studentWithoutTxt.isEmpty()) {
                report.append("  (Không có)\n");
            } else {
                studentWithoutTxt.forEach(s -> report.append("  - ").append(s).append("\n"));
            }
            report.append("\n");

            // Hiển thị kết quả trên UI thread
            final String finalReport = report.toString();
            Platform.runLater(() -> {
                TextArea output = new TextArea(finalReport);
                output.setEditable(false);
                output.setWrapText(true);
                Alert result = new Alert(Alert.AlertType.INFORMATION);
                result.setTitle("Kết quả kiểm tra ổ G:\\");
                result.setHeaderText("Thống kê chi tiết (May1..May50)");
                result.getDialogPane().setContent(output);
                result.getDialogPane().setPrefSize(700, 600);
                result.showAndWait();
            });
        }).exceptionally(ex -> {
            showAlertOnUIThread("Lỗi trong quá trình kiểm tra: " + ex.getMessage(), Alert.AlertType.ERROR);
            return null;
        });
    }

    // Helper hiển thị alert an toàn từ background thread
    private void showAlertOnUIThread(String message, Alert.AlertType type) {
        Platform.runLater(() -> {
            Alert a = new Alert(type);
            a.setTitle("Thông báo");
            a.setHeaderText(null);
            a.setContentText(message);
            a.showAndWait();
        });
    }
}