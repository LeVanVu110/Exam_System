package com.example.studentapp;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.stage.Stage;

import java.io.IOException;

public class Main extends Application {

    @Override
    public void start(Stage stage) throws IOException {
        try {
            FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource("/fxml/room-exam.fxml"));
            Scene scene = new Scene(fxmlLoader.load());

            stage.setTitle("Nhập phòng");
            stage.setScene(scene);
            stage.show();
        } catch (IOException e) {
            e.printStackTrace();
            // Xử lý lỗi nếu không tìm thấy hoặc không load được file FXML
            System.err.println("Không thể load file FXML. Vui lòng kiểm tra đường dẫn: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            // Bắt các lỗi khác
        }
    }

    public static void main(String[] args) {
        launch(args);
    }
}