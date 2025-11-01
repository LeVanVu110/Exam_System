package com.example.studentapp.controller;

import com.example.studentapp.service.ApiLogin;
import javafx.fxml.FXML;
import javafx.scene.control.Label;
import javafx.stage.FileChooser;
import javafx.stage.Stage;
import java.io.File;

public class UploadController {
    @FXML private Label fileLabel;
    @FXML private Label statusLabel;

    private File selectedFile;

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
        boolean success = ApiLogin.uploadExamFile(selectedFile);
        statusLabel.setText(success ? "Nộp bài thành công!" : "Nộp bài thất bại!");
    }
}