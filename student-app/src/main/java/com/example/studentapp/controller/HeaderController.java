package com.example.studentapp.controller;

import com.example.studentapp.service.TokenManager;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

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
    private void handleLogout() {
        try {
            // Gọi API logout
            String apiUri = "http://localhost:8000/api/logout";
            String token = TokenManager.getInstance().getBearerToken();

            if (token != null) {
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(apiUri))
                        .header("Authorization", token)
                        .header("Accept", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString("{}"))
                        .build();

                HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
            }

            // ✅ XÓA TOKEN
            TokenManager.getInstance().clearToken();

            // ✅ Quay về màn hình login
            Stage currentStage = (Stage) btnLogout.getScene().getWindow();
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/view/login/login.fxml"));
            Scene scene = new Scene(loader.load());
            currentStage.setScene(scene);
            currentStage.setTitle("Exam Collection System - Login");
            currentStage.centerOnScreen();
            currentStage.show();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
