package com.example.studentapp.controller;

import com.example.studentapp.model.ExamSession;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.cell.PropertyValueFactory;

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

    private final ObservableList<ExamSession> examList = FXCollections.observableArrayList();

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
            String apiUrl = "http://127.0.0.1:8000/api/exam-sessions"; // đổi thành URL backend của bạn nếu khác
            URL url = new URL(apiUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Accept", "application/json");
            conn.connect();

            int responseCode = conn.getResponseCode();
            System.out.println("Response Code: " + responseCode);

            if (responseCode == 200) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();

                System.out.println("API Response: " + response);

                Gson gson = new Gson();
                JsonObject json = gson.fromJson(response.toString(), JsonObject.class);

                // Nếu Laravel trả về dạng { "data": [...] }
                if (json.has("data")) {
                    Type listType = new TypeToken<List<ExamSession>>(){}.getType();
                    List<ExamSession> list = gson.fromJson(json.get("data"), listType);
                    examList.setAll(list);
                } else {
                    // Nếu trả về mảng gốc không có "data"
                    Type listType = new TypeToken<List<ExamSession>>(){}.getType();
                    List<ExamSession> list = gson.fromJson(response.toString(), listType);
                    examList.setAll(list);
                }

                tableExam.setItems(examList);
            } else {
                System.out.println("❌ API Error code: " + responseCode);
            }

        } catch (Exception e) {
            System.out.println("🔥 Lỗi khi tải dữ liệu:");
            e.printStackTrace();
        }
    }
}
