package com.example.studentapp.controller;

import com.example.studentapp.service.ApiService;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.layout.VBox;
import javafx.stage.FileChooser;
import javafx.stage.Stage;

import java.io.File;
import java.io.IOException;

public class UploadController {
    @FXML private VBox rootVBox;
    @FXML private Label fileLabel;
    @FXML private Label statusLabel;

    private File selectedFile;

    @FXML
    public void initialize() {
        // ✅ Tạo menu chuột phải
        ContextMenu contextMenu = new ContextMenu();

        MenuItem checkFolderItem = new MenuItem("Kiểm tra thư mục D:/Kiểm Tra");
        checkFolderItem.setOnAction(e -> checkExamFolders());

        MenuItem openFolderItem = new MenuItem("Mở thư mục D:/Kiểm Tra");
        openFolderItem.setOnAction(e -> openExamFolder());

        contextMenu.getItems().addAll(checkFolderItem, openFolderItem);

        // Gán menu chuột phải cho toàn bộ VBox
        rootVBox.setOnContextMenuRequested(event ->
                contextMenu.show(rootVBox, event.getScreenX(), event.getScreenY())
        );
    }

    @FXML
    private void chooseFile() {
        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Chọn file bài thi");
        selectedFile = fileChooser.showOpenDialog(new Stage());
        if (selectedFile != null) {
            fileLabel.setText("Đã chọn: " + selectedFile.getName());
        }
    }

    @FXML
    private void uploadFile() {
        if (selectedFile == null) {
            statusLabel.setText("Vui lòng chọn file trước!");
            return;
        }
        boolean success = ApiService.uploadExamFile(selectedFile);
        statusLabel.setText(success ? "✅ Nộp bài thành công!" : "❌ Nộp bài thất bại!");
    }

    // 🔹 Kiểm tra thư mục D:/Kiểm Tra có trống không
    private void checkExamFolders() {
        String basePath = "D:/Kiểm Tra";
        File baseDir = new File(basePath);

        if (!baseDir.exists()) {
            showAlert("Thông báo", "Thư mục 'D:/Kiểm Tra' chưa tồn tại!");
            return;
        }

        File[] folders = baseDir.listFiles();
        if (folders == null || folders.length == 0) {
            showAlert("Kết quả", "Thư mục 'D:/Kiểm Tra' đang trống!");
            return;
        }

        StringBuilder result = new StringBuilder();
        for (File folder : folders) {
            if (folder.isDirectory()) {
                File[] files = folder.listFiles();
                if (files == null || files.length == 0) {
                    result.append(folder.getName()).append(": trống\n");
                } else {
                    result.append(folder.getName()).append(": có ").append(files.length).append(" file\n");
                }
            }
        }

        showAlert("Kết quả kiểm tra", result.toString());
    }

    // 🔹 Mở thư mục D:/Kiểm Tra trong File Explorer
    private void openExamFolder() {
        try {
            File dir = new File("D:/Kiểm Tra");
            if (!dir.exists()) {
                showAlert("Lỗi", "Thư mục 'D:/Kiểm Tra' chưa tồn tại!");
                return;
            }
            new ProcessBuilder("explorer.exe", dir.getAbsolutePath()).start();
        } catch (IOException e) {
            e.printStackTrace();
            showAlert("Lỗi", "Không thể mở thư mục!");
        }
    }

    // 🔹 Hiển thị hộp thoại thông báo
    private void showAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }
}
