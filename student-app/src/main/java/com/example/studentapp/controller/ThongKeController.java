package com.example.studentapp.controller;

import com.example.studentapp.model.ThongKeModel;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import javafx.application.Platform;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.layout.VBox;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URL;
import java.util.ResourceBundle;

public class ThongKeController implements Initializable {

    @FXML private TableView<ThongKeModel> tableThongKe;
    @FXML private TableColumn<ThongKeModel, String> colMaCa;
    @FXML private TableColumn<ThongKeModel, String> colTenMon;
    @FXML private TableColumn<ThongKeModel, Integer> colTongMay;
    @FXML private TableColumn<ThongKeModel, Integer> colDaNop;
    @FXML private TableColumn<ThongKeModel, Integer> colMayTrong;

    private final ObservableList<ThongKeModel> listData = FXCollections.observableArrayList();
    private final HttpClient client = HttpClient.newHttpClient();
    private final Gson gson = new Gson();

    // Cổng 8006 theo Docker của bạn
    private static final String API_SESSION_URL = "http://localhost:8006/api/exam-sessions";
    private static final String API_SUBMISSION_URL = "http://localhost:8006/api/exam-submissions";

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        setupTable();
        loadDataSessions();
    }

    private void setupTable() {
        colMaCa.setCellValueFactory(new PropertyValueFactory<>("maCaThi"));
        colTenMon.setCellValueFactory(new PropertyValueFactory<>("tenMon"));
        colTongMay.setCellValueFactory(new PropertyValueFactory<>("tongSoMay"));
        colDaNop.setCellValueFactory(new PropertyValueFactory<>("daNop"));
        colMayTrong.setCellValueFactory(new PropertyValueFactory<>("mayTrong"));

        tableThongKe.setItems(listData);

        // Sự kiện Double Click để xem chi tiết
        tableThongKe.setRowFactory(tv -> {
            TableRow<ThongKeModel> row = new TableRow<>();
            row.setOnMouseClicked(event -> {
                if (event.getClickCount() == 2 && (!row.isEmpty())) {
                    ThongKeModel rowData = row.getItem();
                    showFileDetails(rowData); // Gọi hàm xem chi tiết
                }
            });
            return row;
        });
    }

    // 1. Load danh sách ca thi
    private void loadDataSessions() {
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(API_SESSION_URL)).GET().build();
        client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(HttpResponse::body)
                .thenAccept(this::parseSessions);
    }

    private void parseSessions(String json) {
        Platform.runLater(() -> {
            try {
                JsonElement rootElement = gson.fromJson(json, JsonElement.class);
                JsonArray data = new JsonArray();

                // Xử lý JSON trả về (Object chứa data hay Array trực tiếp)
                if (rootElement.isJsonObject() && rootElement.getAsJsonObject().has("data")) {
                    data = rootElement.getAsJsonObject().getAsJsonArray("data");
                } else if (rootElement.isJsonArray()) {
                    data = rootElement.getAsJsonArray();
                }

                listData.clear();
                for (JsonElement elem : data) {
                    JsonObject obj = elem.getAsJsonObject();
                    int id = getInt(obj, "exam_session_id");
                    String ma = getVal(obj, "exam_code");
                    String ten = getVal(obj, "subject_name");
                    int tong = getInt(obj, "total_students");
                    int nop = getInt(obj, "submitted_count");

                    listData.add(new ThongKeModel(id, ma, ten, tong, nop));
                }
            } catch (Exception e) { e.printStackTrace(); }
        });
    }

    // 2. Xem chi tiết file nộp
    private void showFileDetails(ThongKeModel session) {
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(API_SUBMISSION_URL)).GET().build();
        
        client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
            .thenApply(HttpResponse::body)
            .thenAccept(json -> Platform.runLater(() -> displaySubmissionPopup(session, json)));
    }

    // --- HÀM NÀY ĐÃ ĐƯỢC SỬA LẠI ĐỂ XỬ LÝ JSON ARRAY ---
    private void displaySubmissionPopup(ThongKeModel session, String jsonResponse) {
        try {
            JsonArray allSubmissions = new JsonArray();
            JsonElement jsonElement = gson.fromJson(jsonResponse, JsonElement.class);

            // [QUAN TRỌNG] Kiểm tra kiểu dữ liệu trả về
            if (jsonElement.isJsonArray()) {
                allSubmissions = jsonElement.getAsJsonArray();
            } else if (jsonElement.isJsonObject() && jsonElement.getAsJsonObject().has("data")) {
                allSubmissions = jsonElement.getAsJsonObject().getAsJsonArray("data");
            }

            VBox content = new VBox(10);
            content.setStyle("-fx-padding: 15;");
            
            TableView<SubmissionFile> tableFiles = new TableView<>();
            TableColumn<SubmissionFile, String> colFile = new TableColumn<>("Tên File");
            colFile.setCellValueFactory(new PropertyValueFactory<>("fileName"));
            colFile.setPrefWidth(200);
            
            TableColumn<SubmissionFile, String> colPath = new TableColumn<>("Đường dẫn / Sinh viên");
            colPath.setCellValueFactory(new PropertyValueFactory<>("path"));
            colPath.setPrefWidth(250);
            
            TableColumn<SubmissionFile, String> colSize = new TableColumn<>("Kích thước");
            colSize.setCellValueFactory(new PropertyValueFactory<>("size"));
            
            tableFiles.getColumns().addAll(colFile, colPath, colSize);
            
            ObservableList<SubmissionFile> fileList = FXCollections.observableArrayList();
            int countReal = 0;

            for (JsonElement elem : allSubmissions) {
                JsonObject obj = elem.getAsJsonObject();
                // So sánh ID ca thi
                int sessionId = getInt(obj, "exam_session_id");
                if (sessionId == session.getId()) {
                    String name = getVal(obj, "file_name");
                    String path = getVal(obj, "network_file_path");
                    String size = getVal(obj, "file_size") + " KB";
                    fileList.add(new SubmissionFile(name, path, size));
                    countReal++;
                }
            }
            
            tableFiles.setItems(fileList);
            content.getChildren().add(new Label("Danh sách file trong gói nộp của ca thi: " + session.getMaCaThi()));
            content.getChildren().add(tableFiles);

            // Cập nhật số liệu thực tế vào bảng chính
            if (countReal != session.getDaNop()) {
                session.setDaNop(countReal);
                tableThongKe.refresh(); 
                new Alert(Alert.AlertType.INFORMATION, "Đã cập nhật lại số liệu từ file: " + countReal + " bài.").show();
            }

            // Hiển thị Dialog
            Dialog<Void> dialog = new Dialog<>();
            dialog.setTitle("Chi tiết file nộp - " + session.getTenMon());
            dialog.getDialogPane().setContent(content);
            dialog.getDialogPane().getButtonTypes().add(ButtonType.CLOSE);
            dialog.show();

        } catch (Exception e) {
            e.printStackTrace();
            new Alert(Alert.AlertType.ERROR, "Lỗi phân tích dữ liệu file: " + e.getMessage()).show();
        }
    }

    // Class nội bộ
    public static class SubmissionFile {
        private String fileName;
        private String path;
        private String size;
        public SubmissionFile(String f, String p, String s) { this.fileName = f; this.path = p; this.size = s; }
        public String getFileName() { return fileName; }
        public String getPath() { return path; }
        public String getSize() { return size; }
    }

    // Tiện ích
    private String getVal(JsonObject obj, String k) {
        return (obj.has(k) && !obj.get(k).isJsonNull()) ? obj.get(k).getAsString() : "";
    }
    private int getInt(JsonObject obj, String k) {
        try { return obj.has(k) && !obj.get(k).isJsonNull() ? obj.get(k).getAsInt() : 0; } catch (Exception e) { return 0; }
    }
}