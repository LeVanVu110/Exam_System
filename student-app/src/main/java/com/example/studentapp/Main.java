package com.example.studentapp;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.stage.Stage;

import java.io.IOException;

public class Main extends Application {
    @Override
    public void start(Stage stage) throws IOException {
        
        // SỬA DÒNG NÀY:
        // CŨ: new FXMLLoader(Main.class.getResource("LichThiView.fxml"));
        // MỚI: Thêm dấu "/" ở đầu để tìm từ thư mục gốc
        FXMLLoader fxmlLoader = new FXMLLoader(Main.class.getResource("/LichThiView.fxml"));
        
        Scene scene = new Scene(fxmlLoader.load(), 1200, 750); 
        
        // Dòng này cũng cần dấu "/"
        scene.getStylesheets().add(getClass().getResource("/application.css").toExternalForm());
        
        stage.setTitle("Quản lý Lịch thi");
        stage.setScene(scene);
        stage.show();
    }

    public static void main(String[] args) {
        launch();
    }
}

