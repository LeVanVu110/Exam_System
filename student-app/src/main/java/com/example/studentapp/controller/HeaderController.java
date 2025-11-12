package com.example.studentapp.controller;

import javafx.animation.Animation;
import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.fxml.Initializable;
import javafx.scene.control.Tooltip;
import javafx.util.Duration;

import java.net.URL;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ResourceBundle;

import javafx.event.ActionEvent;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;
import javafx.scene.Node;
import java.io.IOException;

public class HeaderController implements Initializable {

    @FXML
    private Label lblDateTime;
    @FXML
    private Label lblNameTeacher;
    @FXML
    private Button btnLogout;
    @FXML
    private Tooltip tooltipName;

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");

    private MainController mainController;

    public void setMainController(MainController mainController) {
        this.mainController = mainController;
    }

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        startClock();
    }

    public void setTeacherInfo(String fullName) {
        lblNameTeacher.setText(fullName);

        tooltipName.setText(fullName);
    }

    private void startClock() {
        Timeline clock = new Timeline(
                new KeyFrame(Duration.ZERO, e -> {

                    LocalDateTime now = LocalDateTime.now();

                    lblDateTime.setText(now.format(formatter));

                }), new KeyFrame(Duration.seconds(1)));
        clock.setCycleCount(Animation.INDEFINITE);

        clock.play();
    }

    @FXML
    private void handleLogout(ActionEvent event) {
        try {
            // Load FXML login
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/view/login/login.fxml"));
            Scene loginScene = new Scene(loader.load(), 480, 600); // Kích thước cố định

            // Lấy stage hiện tại từ event
            Stage stage = (Stage) ((javafx.scene.Node) event.getSource()).getScene().getWindow();

            // Set scene login với kích thước cố định
            stage.setScene(loginScene);
            stage.setTitle("Exam Collection System - Login");
            stage.setResizable(false); // ⚡ Không cho resize
            stage.setWidth(480);
            stage.setHeight(600);
            stage.centerOnScreen(); // Canh giữa màn hình
            stage.show();

        } catch (IOException e) {
            e.printStackTrace();
            System.err.println("Không thể load login.fxml khi logout.");
        }
    }

}
