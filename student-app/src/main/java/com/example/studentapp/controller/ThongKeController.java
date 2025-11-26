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
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.cell.PropertyValueFactory;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URL;
import java.util.ResourceBundle;

public class ThongKeController implements Initializable {

    @FXML
    private TableView<ThongKeModel> tableThongKe;
    @FXML
    private TableColumn<ThongKeModel, String> colMaCa;
    @FXML
    private TableColumn<ThongKeModel, String> colTenMon;
    @FXML
    private TableColumn<ThongKeModel, Integer> colTongMay;
    @FXML
    private TableColumn<ThongKeModel, Integer> colDaNop;
    @FXML
    private TableColumn<ThongKeModel, Integer> colMayTrong;

    private final ObservableList<ThongKeModel> listData = FXCollections.observableArrayList();
    private static final String API_URL = "http://localhost:8006/api/exam-sessions"; // Cổng 8006 Docker

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        colMaCa.setCellValueFactory(new PropertyValueFactory<>("maCaThi"));
        colTenMon.setCellValueFactory(new PropertyValueFactory<>("tenMon"));
        colTongMay.setCellValueFactory(new PropertyValueFactory<>("tongSoMay"));
        colDaNop.setCellValueFactory(new PropertyValueFactory<>("daNop"));
        colMayTrong.setCellValueFactory(new PropertyValueFactory<>("mayTrong"));

        tableThongKe.setItems(listData);
        loadData();
    }

    private void loadData() {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(API_URL)).GET().build();

        client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(HttpResponse::body)
                .thenAccept(json -> {
                    Platform.runLater(() -> {
                        try {
                            Gson gson = new Gson();
                            JsonObject root = gson.fromJson(json, JsonObject.class);
                            JsonArray data = root.has("data") ? root.getAsJsonArray("data") : new JsonArray();

                            listData.clear();
                            for (JsonElement elem : data) {
                                JsonObject obj = elem.getAsJsonObject();

                                String ma = getVal(obj, "exam_code");
                                String ten = getVal(obj, "subject_name");
                                // Backend cần trả về submitted_count, nếu chưa có thì tạm random hoặc để 0
                                int tong = parseInt(getVal(obj, "total_students"));
                                int nop = parseInt(getVal(obj, "submitted_count"));

                                listData.add(new ThongKeModel(ma, ten, tong, nop));
                            }
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    });
                });
    }

    private String getVal(JsonObject obj, String k) {
        return (obj.has(k) && !obj.get(k).isJsonNull()) ? obj.get(k).getAsString() : "";
    }

    private int parseInt(String s) {
        try {
            return Integer.parseInt(s);
        } catch (Exception e) {
            return 0;
        }
    }
}