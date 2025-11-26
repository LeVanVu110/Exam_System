package com.example.studentapp.controller;

import com.example.studentapp.model.CaThi;
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

import java.net.URI;
import java.net.URL;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ResourceBundle;

public class TongHopQuanLyController implements Initializable {

    // --- Bảng danh sách ---
    @FXML
    private TableView<CaThi> caThiTable;
    @FXML
    private TableColumn<CaThi, String> maHPColumn;
    @FXML
    private TableColumn<CaThi, String> tenHPColumn;
    @FXML
    private TableColumn<CaThi, String> ngayThiColumn;
    @FXML
    private TableColumn<CaThi, String> caThiColumn; // Mới
    @FXML
    private TableColumn<CaThi, String> phongThiColumn; // Mới
    @FXML
    private TableColumn<CaThi, String> cbctColumn; // Mới
    @FXML
    private TableColumn<CaThi, String> trangThaiColumn; // Mới

    // --- Form chi tiết ---
    @FXML
    private Label detailTitleLabel;
    @FXML
    private TextField maHPField;
    @FXML
    private TextField tenHPField;
    @FXML
    private TextField ngayThiField;
    @FXML
    private TextField caThiField;
    @FXML
    private TextField phongThiField;
    @FXML
    private TextField cbctField; // Mới
    @FXML
    private TextField soLuongField; // Mới
    @FXML
    private TextField trangThaiField; // Mới

    private final ObservableList<CaThi> caThiList = FXCollections.observableArrayList();
    private static final String API_URL = "http://127.0.0.1:8006/api/exam-sessions";

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        // 1. Cấu hình cột
        maHPColumn.setCellValueFactory(cell -> cell.getValue().maHPProperty());
        tenHPColumn.setCellValueFactory(cell -> cell.getValue().tenHPProperty());
        ngayThiColumn.setCellValueFactory(cell -> cell.getValue().ngayThiProperty());
        caThiColumn.setCellValueFactory(cell -> cell.getValue().caThiProperty());
        phongThiColumn.setCellValueFactory(cell -> cell.getValue().phongThiProperty());
        cbctColumn.setCellValueFactory(cell -> cell.getValue().cbctProperty());
        trangThaiColumn.setCellValueFactory(cell -> cell.getValue().trangThaiProperty());

        caThiTable.setItems(caThiList);

        // 2. Sự kiện chọn dòng
        caThiTable.getSelectionModel().selectedItemProperty().addListener(
                (observable, oldValue, newValue) -> showCaThiDetails(newValue));

        // 3. Gọi API
        loadDataFromApi();
    }

    private void loadDataFromApi() {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(API_URL)).GET().build();

        client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(HttpResponse::body)
                .thenAccept(this::processApiResponse)
                .exceptionally(e -> {
                    Platform.runLater(() -> showError("Lỗi kết nối", e.getMessage()));
                    return null;
                });
    }

    private void processApiResponse(String jsonResponse) {
        Gson gson = new Gson();
        try {
            JsonElement element = gson.fromJson(jsonResponse, JsonElement.class);
            JsonArray jsonArray = null;

            if (element.isJsonObject() && element.getAsJsonObject().has("data")) {
                jsonArray = element.getAsJsonObject().getAsJsonArray("data");
            } else if (element.isJsonArray()) {
                jsonArray = element.getAsJsonArray();
            }

            if (jsonArray != null) {
                JsonArray finalJsonArray = jsonArray;
                Platform.runLater(() -> {
                    caThiList.clear();
                    for (JsonElement item : finalJsonArray) {
                        try {
                            JsonObject obj = item.getAsJsonObject();

                            // === MAPPING DỮ LIỆU MỚI ===
                            String maHP = getJsonString(obj, "class_code"); // Lấy mã lớp
                            String tenHP = getJsonString(obj, "subject_name");
                            String ngayThi = formatDate(getJsonString(obj, "exam_date"));

                            // Ghép giờ
                            String start = formatTime(getJsonString(obj, "exam_start_time"));
                            String end = formatTime(getJsonString(obj, "exam_end_time"));
                            String ca = start + " - " + end;

                            String phong = getJsonString(obj, "exam_room");

                            // Ghép tên 2 giảng viên
                            String gv1 = getJsonString(obj, "teacher1_name");
                            String gv2 = getJsonString(obj, "teacher2_name");
                            String cbct = (gv1.isEmpty() ? "" : gv1) + (gv2.isEmpty() ? "" : ", " + gv2);

                            String soLuong = getJsonString(obj, "total_students");
                            String trangThai = getJsonString(obj, "status");

                            caThiList.add(new CaThi(maHP, tenHP, ngayThi, ca, phong, cbct, soLuong, trangThai));

                        } catch (Exception innerEx) {
                            System.err.println("Lỗi dòng: " + innerEx.getMessage());
                        }
                    }
                });
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private String getJsonString(JsonObject obj, String key) {
        if (obj.has(key) && !obj.get(key).isJsonNull())
            return obj.get(key).getAsString();
        return "";
    }

    private String formatDate(String rawDate) {
        try {
            return LocalDate.parse(rawDate).format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        } catch (Exception e) {
            return rawDate;
        }
    }

    private String formatTime(String rawTime) {
        return (rawTime != null && rawTime.length() >= 5) ? rawTime.substring(0, 5) : rawTime;
    }

    private void showCaThiDetails(CaThi caThi) {
        if (caThi != null) {
            detailTitleLabel.setText("Chi tiết: " + caThi.getTenHP());
            maHPField.setText(caThi.getMaHP());
            tenHPField.setText(caThi.getTenHP());
            ngayThiField.setText(caThi.getNgayThi());
            caThiField.setText(caThi.getCaThi());
            phongThiField.setText(caThi.getPhongThi());
            cbctField.setText(caThi.getCbct());
            soLuongField.setText(caThi.getSoLuong());
            trangThaiField.setText(caThi.getTrangThai());
        } else {
            maHPField.clear();
            tenHPField.clear();
            ngayThiField.clear();
            caThiField.clear();
            phongThiField.clear();
            cbctField.clear();
            soLuongField.clear();
            trangThaiField.clear();
        }
    }

    private void showError(String title, String content) {
        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(content);
        alert.show();
    }
}