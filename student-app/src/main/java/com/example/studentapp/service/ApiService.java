package com.example.studentapp.service;


import com.example.studentapp.model.RoomResponse;
import com.example.studentapp.model.RoomDetailResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.DataOutputStream;
import java.io.File;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.concurrent.CompletableFuture;


public class ApiService {
    private static final String BASE_URL = "http://localhost:8000/api";


    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public ApiService() {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    public CompletableFuture<Boolean> uploadExamCollection(
            File zipFile,
            int examSessionId,
            String roomName,
            String examTime,
            int studentCount,
            String cbct1,
            String cbct2,
            String notes) {

        return CompletableFuture.supplyAsync(() -> {
            String boundary = "===" + System.currentTimeMillis() + "===";
            // Endpoint này phải khớp với routes/api.php
            String apiUrl = "http://localhost:8000/api/exam-submissions/upload";

            try {
                URL url = new URL(apiUrl);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setDoOutput(true);
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);
                // conn.setRequestProperty("Authorization", "Bearer " + YOUR_TOKEN);

                try (DataOutputStream out = new DataOutputStream(conn.getOutputStream())) {

                    // --- Gửi các trường dữ liệu (phải khớp tên với Laravel validate) ---

                    addFormField(out, boundary, "examSessionId", String.valueOf(examSessionId));
                    addFormField(out, boundary, "roomName", roomName);
                    addFormField(out, boundary, "examTime", examTime);
                    addFormField(out, boundary, "studentCount", String.valueOf(studentCount));
                    addFormField(out, boundary, "cbct1", (cbct1 != null) ? cbct1 : "");
                    addFormField(out, boundary, "cbct2", (cbct2 != null) ? cbct2 : "");
                    addFormField(out, boundary, "notes", (notes != null) ? notes : "");

                    out.writeBytes("--" + boundary + "\r\n");
                    out.writeBytes("Content-Disposition: form-data; name=\"examFile\"; filename=\"" + zipFile.getName() + "\"\r\n");
                    out.writeBytes("Content-Type: application/zip\r\n\r\n");

                    Files.copy(zipFile.toPath(), out); // Copy file
                    out.writeBytes("\r\n");

                    // --- Kết thúc multipart ---
                    out.writeBytes("--" + boundary + "--\r\n");
                    out.flush();
                }

                int responseCode = conn.getResponseCode();
                System.out.println("Upload status: " + responseCode);

                return responseCode == 201; // 201 Created

            } catch (Exception e) {
                e.printStackTrace();
                System.err.println("Lỗi khi upload file: " + e.getMessage());
                return false;
            }
        });
    }

    // [HÀM TIỆN ÍCH MỚI] để thêm một trường text vào multipart
    private void addFormField(DataOutputStream out, String boundary, String name, String value) throws IOException {
        out.writeBytes("--" + boundary + "\r\n");
        out.writeBytes("Content-Disposition: form-data; name=\"" + name + "\"\r\n\r\n");
        // Ghi giá trị bằng UTF-8 để hỗ trợ Tiếng Việt
        out.write(value.getBytes(StandardCharsets.UTF_8));
        out.writeBytes("\r\n");
    }

    public CompletableFuture<RoomResponse> fetchAllExamsForToday() {

        String apiUri = BASE_URL + "/exam-sessions/today";

        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(apiUri)).GET().build();

        return sendRequestAndParseResponse(request);
    }

    public CompletableFuture<RoomResponse> searchExamsForRoom(String roomName) {

        String encodedRoomName = roomName.trim();

        String apiUri = BASE_URL + "/exam-sessions/search?room=" + encodedRoomName;

        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(apiUri)).GET().build();

        return sendRequestAndParseResponse(request);
    }

    public CompletableFuture<RoomDetailResponse> fetchExamById(int examId) {

        String apiUri = BASE_URL + "/exam-sessions/" + examId;

        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(apiUri)).GET().build();

        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(HttpResponse::body)
                .thenApply(jsonBody -> {
                    try {
                        return objectMapper.readValue(jsonBody, RoomDetailResponse.class);
                    } catch (Exception e) {
                        throw new RuntimeException("Lỗi phân tích JSON (Detail)", e);
                    }
                });
    }

    private CompletableFuture<RoomResponse> sendRequestAndParseResponse(HttpRequest request) {
        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString()).thenApply(HttpResponse::body).thenApply(jsonBody -> {
            try {
                return objectMapper.readValue(jsonBody, RoomResponse.class);
            } catch (Exception e) {
                throw new RuntimeException("Lỗi phân tích JSON", e);
            }
        });
    }

}
