package com.example.studentapp.controller;

import com.example.studentapp.model.ExamSession;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.cell.PropertyValueFactory;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.lang.reflect.Type;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;

public class ExamSessionController {

    @FXML private TableView<ExamSession> tableExam;
    @FXML private TableColumn<ExamSession, String> colCode;
    @FXML private TableColumn<ExamSession, String> colClass;
    @FXML private TableColumn<ExamSession, String> colSubject;
    @FXML private TableColumn<ExamSession, String> colDate;
    @FXML private TableColumn<ExamSession, String> colTime;
    @FXML private TableColumn<ExamSession, String> colRoom;
    @FXML private TableColumn<ExamSession, String> colFaculty;
    @FXML private TableColumn<ExamSession, String> colTeacher;

    @FXML
    public void initialize() {
        colCode.setCellValueFactory(new PropertyValueFactory<>("exam_code"));
        colClass.setCellValueFactory(new PropertyValueFactory<>("class_code"));
        colSubject.setCellValueFactory(new PropertyValueFactory<>("subject_name"));
        colDate.setCellValueFactory(new PropertyValueFactory<>("exam_date"));
        colTime.setCellValueFactory(new PropertyValueFactory<>("exam_time"));
        colRoom.setCellValueFactory(new PropertyValueFactory<>("exam_room"));
        colFaculty.setCellValueFactory(new PropertyValueFactory<>("exam_faculty"));
        colTeacher.setCellValueFactory(new PropertyValueFactory<>("exam_teacher"));

        loadExamSessions();
    }

    private void loadExamSessions() {
        try {
            String apiUrl = "http://localhost:8000/api/exam-sessions";
            URL url = new URL(apiUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.connect();

            BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            StringBuilder jsonBuilder = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) jsonBuilder.append(line);
            reader.close();
            conn.disconnect();

            Gson gson = new Gson();
            Type listType = new TypeToken<List<ExamSession>>() {}.getType();
            List<ExamSession> examList = gson.fromJson(jsonBuilder.toString(), listType);

            ObservableList<ExamSession> data = FXCollections.observableArrayList(examList);
            tableExam.setItems(data);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

