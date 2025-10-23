package com.example.studentapp;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.stage.Stage;

import java.io.IOException;

public class Main extends Application {

    @Override
    public void start(Stage stage) throws IOException {
        
        // Tải màn hình Đăng nhập (login.fxml)
        FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource("/LichThiView.fxml"));
        Scene scene = new Scene(fxmlLoader.load(), 400, 300); // Kích thước nhỏ hơn cho Login

        stage.setTitle("Hệ Thống Thu Bài Thi TDC");
        stage.setScene(scene);
        stage.show();
    }

    public static void main(String[] args) {
        launch();
    }
}