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
        FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource("/login.fxml"));
        Scene scene = new Scene(fxmlLoader.load(), 400, 300);
        stage.setTitle("Đăng nhập");
        stage.setScene(scene);
        stage.show();
    } catch (Exception e) {
        e.printStackTrace(); // In ra lỗi thật
    }
    }

    public static void main(String[] args) {
        launch();
    }
}