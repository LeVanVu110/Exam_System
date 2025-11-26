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

    // --- Form chi tiết (Chỉ xem) ---
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

    private final ObservableList<CaThi> caThiList = FXCollections.observableArrayList();

    // ĐƯỜNG DẪN API (Trỏ về server Laravel của bạn)
    private static final String API_URL = "http://127.0.0.1:8000/api/exam-sessions";

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        // 1. Cấu hình cột cho TableView
        maHPColumn.setCellValueFactory(cellData -> cellData.getValue().maHPProperty());
        tenHPColumn.setCellValueFactory(cellData -> cellData.getValue().tenHPProperty());
        ngayThiColumn.setCellValueFactory(cellData -> cellData.getValue().ngayThiProperty());

        // 2. Gán danh sách vào bảng
        caThiTable.setItems(caThiList);

        // 3. Sự kiện: Khi chọn 1 dòng -> Hiển thị chi tiết
        caThiTable.getSelectionModel().selectedItemProperty().addListener(
                (observable, oldValue, newValue) -> showCaThiDetails(newValue));

        // 4. Gọi API lấy dữ liệu từ Backend
        loadDataFromApi();
    }

    private void loadDataFromApi() {
        // Tạo HttpClient
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(API_URL))
                .GET()
                .build();

        // Gửi request bất đồng bộ (Async)
        client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(HttpResponse::body)
                .thenAccept(this::processApiResponse)
                .exceptionally(e -> {
                    Platform.runLater(
                            () -> showError("Lỗi kết nối", "Không thể kết nối đến server Laravel: " + e.getMessage()));
                    return null;
                });
    }

    private void processApiResponse(String jsonResponse) {
        // [DEBUG] In ra console để xem cấu trúc JSON thực tế trả về
        System.out.println("API Response: " + jsonResponse);

        Gson gson = new Gson();
        try {
            JsonElement element = gson.fromJson(jsonResponse, JsonElement.class);
            JsonArray jsonArray = null;

            // Xử lý các định dạng trả về phổ biến của Laravel
            if (element.isJsonObject() && element.getAsJsonObject().has("data")) {
                // Trường hợp trả về: { "data": [...] } (Laravel Resource Collection)
                jsonArray = element.getAsJsonObject().getAsJsonArray("data");
            } else if (element.isJsonArray()) {
                // Trường hợp trả về: [...] (Mảng trực tiếp)
                jsonArray = element.getAsJsonArray();
            }

            if (jsonArray != null) {
                JsonArray finalJsonArray = jsonArray;
                Platform.runLater(() -> {
                    caThiList.clear();
                    for (JsonElement item : finalJsonArray) {
                        try {
                            JsonObject obj = item.getAsJsonObject();

                            // --- [QUAN TRỌNG] MAPPING KEY JSON ---
                            // Hãy sửa các chuỗi bên phải cho khớp với JSON in ra ở Console
                            // Ví dụ: Database bảng courses có cột 'course_code' thì sửa thành "course_code"

                            String maHP = getJsonString(obj, "subject_code");
                            // Nếu null thử: "course_code" hoặc "ma_hoc_phan"

                            String tenHP = getJsonString(obj, "subject_name");
                            // Nếu null thử: "course_name" hoặc "ten_hoc_phan"

                            String ngayThiRaw = getJsonString(obj, "exam_date");

                            String ca = getJsonString(obj, "shift");

                            String phong = getJsonString(obj, "room");

                            // Thêm vào danh sách hiển thị
                            caThiList.add(new CaThi(maHP, tenHP, formatDate(ngayThiRaw), ca, phong));
                        } catch (Exception innerEx) {
                            System.err.println("Lỗi parse dòng dữ liệu: " + innerEx.getMessage());
                        }
                    }
                });
            } else {
                Platform.runLater(() -> showError("Lỗi dữ liệu", "API không trả về danh sách hợp lệ."));
            }

        } catch (Exception e) {
            e.printStackTrace();
            Platform.runLater(() -> showError("Lỗi xử lý", "Không thể đọc dữ liệu JSON."));
        }
    }

    // Hàm lấy chuỗi từ JSON an toàn (tránh null)
    private String getJsonString(JsonObject obj, String key) {
        if (obj.has(key) && !obj.get(key).isJsonNull()) {
            return obj.get(key).getAsString();
        }
        return ""; // Trả về rỗng nếu không tìm thấy key
    }

    // Format ngày yyyy-MM-dd sang dd/MM/yyyy
    private String formatDate(String rawDate) {
        try {
            if (rawDate == null || rawDate.isEmpty())
                return "";
            LocalDate date = LocalDate.parse(rawDate); // Mặc định parse yyyy-MM-dd
            return date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        } catch (Exception e) {
            return rawDate; // Nếu lỗi format (do chuỗi lạ) thì giữ nguyên
        }
    }

    // Hiển thị chi tiết khi click vào bảng
    private void showCaThiDetails(CaThi caThi) {
        if (caThi != null) {
            detailTitleLabel.setText("Chi tiết: " + caThi.getMaHP());
            maHPField.setText(caThi.getMaHP());
            tenHPField.setText(caThi.getTenHP());
            ngayThiField.setText(caThi.getNgayThi());
            caThiField.setText(caThi.getCaThi());
            phongThiField.setText(caThi.getPhongThi());
        } else {
            detailTitleLabel.setText("Thông tin chi tiết");
            maHPField.clear();
            tenHPField.clear();
            ngayThiField.clear();
            caThiField.clear();
            phongThiField.clear();
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