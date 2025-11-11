package com.example.studentapp.controller;

import com.example.studentapp.model.CheckResultModel;
import com.example.studentapp.model.RoomDetailResponse;
import com.example.studentapp.model.RoomModel;
import com.example.studentapp.service.ApiService;
import com.example.studentapp.service.FolderScanService;
import com.example.studentapp.view.ScanResultDialog;
import javafx.application.Platform;
import javafx.beans.binding.Bindings;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.layout.ColumnConstraints;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.Priority;
import javafx.scene.layout.VBox;
import javafx.util.Pair;
import javafx.concurrent.Task;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
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
    private Button btnThuBaiThi;
    @FXML
    private Button btnKiemTra;

    private MainController mainController;
    private final ApiService apiService = new ApiService();
    private RoomModel currentRoom;
    private int currentExamSeesionId;
    private Dialog<Void> progressDialog;

    public void setMainController(MainController mainController) {
        this.mainController = mainController;
    }

    // Hàm call API để tải dử liệu
    public void loadExamDetail(int examSessionId) {
        this.currentExamSeesionId = examSessionId;

        apiService.fetchExamById(examSessionId).thenAccept(response -> {
            Platform.runLater(() -> updateUiWithResponse(response));
        }).exceptionally(e -> {
            Platform.runLater(() -> System.out.println("Lỗi tải dữ liệu chi tiết ca thi: " + e.getMessage()));
            return null;
        });

    }

    // Hàm cập nhật dữ liệu khi vào chi tiết phòng thi
    private void updateUiWithResponse(RoomDetailResponse response) {
        RoomModel room = response.getData();

        this.currentRoom = room;

        btnBack.setOnAction(this::handleBack);
        btnThayDoiCBCT.setOnAction(this::handleShowForm);
        btnKiemTra.setOnAction(this::handleKiemTra);
        btnThuBaiThi.setOnAction(this::handleThuBaiThi);

        validationNumber(txtSoLuongMay, 99);

        String soSVString = room.soSVProperty().get();
        int soSV = 0;
        try {
            soSV = Integer.parseInt(soSVString.trim());
        } catch (NumberFormatException e) {
            System.out.println("Giá trị soSV không hợp lệ: " + soSVString);
        }
        validationNumber(txtSoLuongSV, soSV);

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

    // Hàm cho nhập số tối thiểu
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

                            textField.setText(null);
                        });
                    }
                } catch (NumberFormatException e) {
                    Platform.runLater(() -> textField.setText(null));
                }
            }
        });
    }

    // Hàm cho nhập ghi chú tổi thiểu
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

    // Hàm quay trở lại
    @FXML
    void handleBack(ActionEvent event) {
        // "Nhờ" cha chuyển về trang danh sách
        if (mainController != null) {
            mainController.showExamListPage();
        }
    }

    // Hàm hiển thị Dialog để đổi tên CBCT
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

    // Hàm xử lý kiểm tra folder bài thu
    @FXML
    void handleKiemTra(ActionEvent event) {
        final String baseDrive = "G:\\";
        final int totalMachines;
        final int expectedStudents;

        try {
            totalMachines = Integer.parseInt(txtSoLuongMay.getText().trim());
        } catch (NumberFormatException ex) {
            showAlertOnUIThread("Giá trị số lượng máy không hợp lệ.", Alert.AlertType.ERROR);
            return;
        }

        try {
            expectedStudents = Integer.parseInt(txtSoLuongSV.getText().trim());
        } catch (NumberFormatException ex) {
            showAlertOnUIThread("Giá trị số lượng sinh viên không hợp lệ.", Alert.AlertType.ERROR);
            return;
        }

        FolderScanService scanService = new FolderScanService();

        Task<CheckResultModel> scanTask = new Task<>() {
            @Override
            protected CheckResultModel call() throws Exception {
                return scanService.scanFolders(baseDrive, totalMachines);
            }
        };

        scanTask.setOnSucceeded(e -> {
            CheckResultModel result = scanTask.getValue();

            ScanResultDialog resultDialog = new ScanResultDialog(result, expectedStudents);
            resultDialog.showAndWait();
        });

        scanTask.setOnFailed(e -> {
            Throwable ex = scanTask.getException();
            showAlertOnUIThread("Lỗi trong quá trình kiểm tra: " + ex.getMessage(), Alert.AlertType.ERROR);
        });

        new Thread(scanTask).start();
    }

    // Hàm xử lý thu bài thi
    @FXML
    void handleThuBaiThi(ActionEvent event) {
        // 1. Lấy thông tin
        final String baseDrive = "G:\\";
        final int studentCount;

        // Lấy thông tin trực tiếp từ Model và UI
        final String roomName = this.currentRoom.roomProperty().get();
        final String examTime = this.currentRoom.gioThiProperty().get();
        final String cbct1 = this.currentRoom.cbct1Property().get();
        final String cbct2 = this.currentRoom.cbct2Property().get();
        final String notes = txtGhiChu.getText();
        final int examSessionId = this.currentExamSeesionId;

        try {
            studentCount = Integer.parseInt(txtSoLuongSV.getText().trim());
            if (studentCount <= 0) {
                showAlertOnUIThread("Số lượng sinh viên phải lớn hơn 0.", Alert.AlertType.WARNING);
                return;
            }
        } catch (NumberFormatException ex) {
            showAlertOnUIThread("Giá trị số lượng sinh viên không hợp lệ.", Alert.AlertType.ERROR);
            return;
        }

        // 2. Hiển thị xác nhận
        Alert confirmAlert = new Alert(Alert.AlertType.CONFIRMATION);
        confirmAlert.setTitle("Xác nhận Thu Bài");
        confirmAlert.setHeaderText("Bạn có chắc chắn muốn nộp bài cho ca thi này không?");
        confirmAlert.setContentText(
                "Phòng: " + roomName + "\n" +
                        "Ca thi: " + examTime + "\n" +
                        "Số SV: " + studentCount + "\n\n" +
                        "Hành động này sẽ nén và gửi bài thi lên hệ thống."
        );

        Optional<ButtonType> result = confirmAlert.showAndWait();

        if (result.isPresent() && result.get() == ButtonType.OK) {
            // 3. Nếu OK -> Bắt đầu quá trình nén và upload
            startCollectionProcess(baseDrive, examSessionId, roomName, examTime, studentCount, cbct1, cbct2, notes);
        }
    }

    // [MỚI] Hàm xử lý nén và upload trong Task (luồng nền)
    private void startCollectionProcess(String sourceDir, int examSessionId, String roomName, String examTime, int studentCount, String cbct1,
                                        String cbct2, String notes) {

        Task<File> zipTask = new Task<>() {
            @Override
            protected File call() throws Exception {
                String safeExamTime = examTime.replace(":", "h").replace(" ", "");
                String safeRoomName = roomName.replace(" ", "");
                String rootFolderNameInZip = String.format("%s_%s_%d", safeRoomName, safeExamTime, studentCount);

                // 2. Tên file zip
                String zipFileName = rootFolderNameInZip + ".zip";
                Path zipFilePath = Paths.get(System.getProperty("java.io.tmpdir"), zipFileName);

                // 3. Gọi hàm nén mới
                zipDirectoryWithCustomRoot(sourceDir, zipFilePath.toString(), rootFolderNameInZip);

                return zipFilePath.toFile();
            }
        };

        // Khi nén file thành công
        zipTask.setOnSucceeded(e -> {
            File zipFile = zipTask.getValue();

            // Gọi ApiService với ĐẦY ĐỦ các tham số
            apiService.uploadExamCollection(zipFile, examSessionId, roomName, examTime, studentCount, cbct1, cbct2, notes)
                    .thenAccept(uploadSuccess -> { // 'uploadSuccess' là Boolean
                        Platform.runLater(() -> {
                            if (uploadSuccess) {
                                showAlertOnUIThread("Thu bài thành công!", Alert.AlertType.INFORMATION);
                                btnThuBaiThi.setDisable(true); // Tắt nút sau khi nộp
                            } else {
                                showAlertOnUIThread("Upload thất bại. Server đã từ chối file hoặc có lỗi mạng.", Alert.AlertType.ERROR);
                            }
                        });
                    })
                    .exceptionally(ex -> {
                        Platform.runLater(() -> {
                            showAlertOnUIThread("Lỗi nghiêm trọng khi tải file: " + ex.getMessage(), Alert.AlertType.ERROR);
                        });
                        return null;
                    });
        });

        // Khi nén file thất bại
        zipTask.setOnFailed(e -> {
            Throwable ex = zipTask.getException();
            Platform.runLater(() -> {
                showAlertOnUIThread("Lỗi trong quá trình nén file: " + ex.getMessage(), Alert.AlertType.ERROR);
            });
        });

        new Thread(zipTask).start();
    }

    public void zipDirectoryWithCustomRoot(String sourceDirPath, String zipFilePath, String rootFolderNameInZip) throws IOException {
        Path p = Paths.get(zipFilePath);
        Path sp = Paths.get(sourceDirPath);

        try (ZipOutputStream zs = new ZipOutputStream(Files.newOutputStream(p))) {

            // Duyệt các thư mục "May..." trong G:\
            Files.walk(sp, 1) // Chỉ duyệt cấp 1 (trong G:\)
                    .filter(path -> !path.equals(sp)) // Bỏ qua chính nó (G:\)
                    .filter(path -> Files.isDirectory(path) && path.getFileName().toString().toLowerCase().startsWith("may"))
                    .forEach(dir -> {
                        try {
                            // Duyệt đệ quy bên trong mỗi thư mục "May..."
                            Files.walkFileTree(dir, new SimpleFileVisitor<Path>() {

                                // Hàm này xử lý từng file
                                public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                                    // 1. Lấy đường dẫn tương đối (vd: "May2\Student\baithi.txt")
                                    Path relativePath = sp.relativize(file);
                                    // 2. Thêm thư mục gốc vào (vd: "A101_07h30_45/May2/Student/baithi.txt")
                                    String zipEntryName = rootFolderNameInZip + "/" + relativePath.toString().replace("\\", "/");

                                    ZipEntry zipEntry = new ZipEntry(zipEntryName);
                                    zs.putNextEntry(zipEntry);
                                    Files.copy(file, zs);
                                    zs.closeEntry();
                                    return FileVisitResult.CONTINUE;
                                }

                                // Hàm này xử lý từng thư mục (để giữ thư mục rỗng)
                                @Override
                                public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
                                    Path relativePath = sp.relativize(dir);
                                    if (relativePath.getNameCount() > 0) {
                                        String zipEntryName = rootFolderNameInZip + "/" + relativePath.toString().replace("\\", "/") + "/";
                                        ZipEntry zipEntry = new ZipEntry(zipEntryName);
                                        zs.putNextEntry(zipEntry);
                                        zs.closeEntry();
                                    }
                                    return FileVisitResult.CONTINUE;
                                }
                            });
                        } catch (IOException e) {
                            throw new RuntimeException("Lỗi khi duyệt thư mục " + dir.toString(), e);
                        }
                    });
        }
    }

    // Hàm show thông báo khi các dữ liệu không hợp lệ
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