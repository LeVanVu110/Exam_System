package com.example.studentapp.controller;

import com.example.studentapp.service.ApiService;
import javafx.fxml.FXML;
import javafx.scene.control.ContextMenu;
import javafx.scene.control.Label;
import javafx.scene.control.MenuItem;
import javafx.scene.input.MouseButton;
import javafx.scene.input.MouseEvent;
import javafx.stage.FileChooser;
import javafx.stage.Stage;

import java.io.File;
import java.io.FilenameFilter;
import java.util.ArrayList;
import java.util.List;

public class UploadController {

    @FXML private Label fileLabel;
    @FXML private Label statusLabel;

    private File selectedFile;

    @FXML
    public void initialize() {
        // Gắn sự kiện chuột phải vào label
        fileLabel.setOnMouseClicked(this::handleRightClick);
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
            statusLabel.setText("⚠️ Vui lòng chọn file trước!");
            return;
        }
        boolean success = ApiService.uploadExamFile(selectedFile);
        statusLabel.setText(success ? "✅ Nộp bài thành công!" : "❌ Nộp bài thất bại!");
    }

    /**
     * Khi click chuột phải → hiển thị danh sách tất cả máy + tổng số
     */
    private void handleRightClick(MouseEvent event) {
        if (event.getButton() == MouseButton.SECONDARY) {
            System.out.println("Right-click detected!");
            List<MachineInfo> machines = getAllMachines("D:/Kiểm Tra/");

            int total = machines.size();
            long emptyCount = machines.stream().filter(MachineInfo::isEmpty).count();
            long filledCount = total - emptyCount;

            ContextMenu menu = new ContextMenu();

            // Thêm dòng tổng số ở đầu
            MenuItem summary = new MenuItem("📊 Tổng số: " + total +
                    " | 🟩 Trống: " + emptyCount +
                    " | 🟥 Có file: " + filledCount);
            summary.setDisable(true); // không click được
            menu.getItems().add(summary);

            menu.getItems().add(new MenuItem("-----------------------------"));

            if (machines.isEmpty()) {
                menu.getItems().add(new MenuItem("❌ Không tìm thấy thư mục máy nào"));
            } else {
                for (MachineInfo may : machines) {
                    String prefix = may.isEmpty() ? "🟩 " : "🟥 ";
                    String text = prefix + may.getName() + (may.isEmpty() ? " (trống)" : " (đã có file)");
                    menu.getItems().add(new MenuItem(text));
                }
            }

            menu.show(fileLabel, event.getScreenX(), event.getScreenY());
        }
    }

    /**
     * Lấy danh sách tất cả máy (thư mục May1, May2, …)
     */
    private List<MachineInfo> getAllMachines(String folderPath) {
        List<MachineInfo> result = new ArrayList<>();
        File baseFolder = new File(folderPath);
        if (!baseFolder.exists()) return result;

        File[] mayFolders = baseFolder.listFiles(File::isDirectory);
        if (mayFolders == null) return result;

        for (File mayFolder : mayFolders) {
            File[] files = mayFolder.listFiles(new FilenameFilter() {
                @Override
                public boolean accept(File dir, String name) {
                    return !name.startsWith(".");
                }
            });
            boolean isEmpty = (files == null || files.length == 0);
            result.add(new MachineInfo(mayFolder.getName(), isEmpty));
        }
        return result;
    }

    // Lớp con nhỏ để lưu thông tin từng máy
    private static class MachineInfo {
        private final String name;
        private final boolean empty;

        public MachineInfo(String name, boolean empty) {
            this.name = name;
            this.empty = empty;
        }

        public String getName() {
            return name;
        }

        public boolean isEmpty() {
            return empty;
        }
    }
}
