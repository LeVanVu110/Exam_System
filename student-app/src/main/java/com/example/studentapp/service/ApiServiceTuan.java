package com.example.studentapp.service;

import com.example.studentapp.model.ApiResponse;
import com.example.studentapp.model.ExamSession;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpRequest.BodyPublishers;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.CompletableFuture;
import java.util.Map;

public class ApiServiceTuan {

    // BASE_URL trỏ đến Mockoon (hoặc backend thật)
    // Giả sử Mockoon đang chạy ở cổng 3000 (theo code cũ của bạn là 3000)
    private static final String BASE_URL = "http://localhost:8006/api";

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    // SỬA LẠI TÊN CONSTRUCTOR CHO ĐÚNG VỚI TÊN CLASS
    public ApiServiceTuan() {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    // =========================================================
    // I. READ (ĐỌC DỮ LIỆU)
    // =========================================================

    /**
     * Lấy tất cả ca thi trong ngày. (READ)
     */
    public CompletableFuture<ApiResponse<ExamSession>> fetchAllExamsForToday() {
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String formatterDate = formatter.format(today);

        String apiUri = BASE_URL + "/exams?date=" + formatterDate; // GET /exams
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(apiUri)).GET().build();
        TypeReference<ApiResponse<ExamSession>> typeRef = new TypeReference<>() {};
        return sendRequestAndParseResponse(request, typeRef);
    }

    /**
     * Lấy ca thi theo phòng trong ngày. (READ - Filter)
     */
    public CompletableFuture<ApiResponse<ExamSession>> fetchExamsByRoomForToday(String roomName) {
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String formatterDate = formatter.format(today);

        String encodedRoomName = URLEncoder.encode(roomName.trim(), StandardCharsets.UTF_8);
        String apiUri = BASE_URL + "/exams?date=" + formatterDate + "&room=" + encodedRoomName;

        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(apiUri)).GET().build();
        TypeReference<ApiResponse<ExamSession>> typeRef = new TypeReference<>() {};
        return sendRequestAndParseResponse(request, typeRef);
    }

    // =========================================================
    // II. CREATE (TẠO MỚI)
    // =========================================================

    /**
     * Tạo mới lịch thi. (CREATE)
     */
    public CompletableFuture<ApiResponse<ExamSession>> createExamSession(ExamSession newSession) {
        String requestBodyJson;
        try {
            requestBodyJson = objectMapper.writeValueAsString(newSession);
        } catch (Exception e) {
            return CompletableFuture.failedFuture(e);
        }

        String apiUri = BASE_URL + "/exams"; // POST /exams

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUri))
                .POST(BodyPublishers.ofString(requestBodyJson))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .build();

        TypeReference<ApiResponse<ExamSession>> typeRef = new TypeReference<>() {};
        return sendRequestAndParseResponse(request, typeRef);
    }

    // =========================================================
    // III. UPDATE (CẬP NHẬT)
    // =========================================================

    /**
     * Cập nhật Cán bộ coi thi (Chỉ sửa một trường). (UPDATE - CBCT)
     */
    public CompletableFuture<Void> updateProctor(String maCaThi, String proctorName) {

        Map<String, String> requestBodyMap = Map.of("canBoCoiThi", proctorName);
        String requestBodyJson;
        try {
            requestBodyJson = objectMapper.writeValueAsString(requestBodyMap);
        } catch (Exception e) {
            return CompletableFuture.failedFuture(e);
        }

        // Lưu ý: Endpoint này phải khớp với backend (/ca-thi hay /exams ?)
        String apiUri = BASE_URL + "/ca-thi/" + maCaThi; 

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUri))
                .PUT(BodyPublishers.ofString(requestBodyJson))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .build();

        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenAccept(response -> {
                    if (response.statusCode() < 200 || response.statusCode() >= 300) {
                        throw new RuntimeException("Lỗi API: " + response.statusCode() + " - " + response.body());
                    }
                });
    }

    /**
     * Cập nhật toàn bộ thông tin ca thi (Từ Form Quản lý). (UPDATE - Full)
     */
    public CompletableFuture<Void> updateExamSession(ExamSession session) {
        String requestBodyJson;
        try {
            requestBodyJson = objectMapper.writeValueAsString(session);
        } catch (Exception e) {
            return CompletableFuture.failedFuture(e);
        }

        String apiUri = BASE_URL + "/exams/" + session.getMaCaThi();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUri))
                .PUT(BodyPublishers.ofString(requestBodyJson))
                .header("Content-Type", "application/json")
                .build();

        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenAccept(response -> {
                    if (response.statusCode() < 200 || response.statusCode() >= 300) {
                        throw new RuntimeException("Lỗi API Update: " + response.statusCode());
                    }
                });
    }

    // =========================================================
    // IV. DELETE (XÓA)
    // =========================================================

    /**
     * Xóa một ca thi. (DELETE)
     */
    public CompletableFuture<Void> deleteExamSession(String maCaThi) {
        String apiUri = BASE_URL + "/exams/" + maCaThi;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUri))
                .DELETE()
                .build();

        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenAccept(response -> {
                    if (response.statusCode() < 200 || response.statusCode() >= 300) {
                        throw new RuntimeException("Lỗi API Delete: " + response.statusCode());
                    }
                });
    }

    // =========================================================
    // V. PHƯƠNG THỨC TRỢ GIÚP
    // =========================================================

    /**
     * Phương thức trợ giúp chung để gửi yêu cầu và phân tích JSON
     */
    private <T> CompletableFuture<ApiResponse<T>> sendRequestAndParseResponse(HttpRequest request,
            TypeReference<ApiResponse<T>> typeRef) {
        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(HttpResponse::body)
                .thenApply(jsonBody -> {
                    try {
                        return objectMapper.readValue(jsonBody, typeRef);
                    } catch (Exception e) {
                        System.err.println("JSON bị lỗi: " + jsonBody);
                        throw new RuntimeException("Lỗi phân tích JSON", e);
                    }
                });
    }
    public CompletableFuture<Void> uploadFile(String maCaThi, File file) {
        String apiUri = BASE_URL + "/upload/" + maCaThi; // Endpoint ví dụ: /upload/CT001

        HttpRequest.BodyPublisher bodyPublisher;
        try {
            // Gửi file dưới dạng binary
            bodyPublisher = HttpRequest.BodyPublishers.ofFile(file.toPath());
        } catch (Exception e) {
            return CompletableFuture.failedFuture(e);
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUri))
                .POST(bodyPublisher)
                .header("Content-Type", "application/octet-stream") // Hoặc "multipart/form-data" nếu dùng thư viện hỗ trợ
                .header("X-File-Name", file.getName()) // Gửi kèm tên file ở header
                .build();

        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenAccept(response -> {
                    if (response.statusCode() < 200 || response.statusCode() >= 300) {
                        throw new RuntimeException("Lỗi Upload API: " + response.statusCode());
                    }
                });
    }
}