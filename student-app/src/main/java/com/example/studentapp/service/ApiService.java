package com.example.studentapp.service;

// Thêm các import cần thiết
import com.example.studentapp.model.ApiResponse;
import com.example.studentapp.model.ExamSession; // <-- Import model ca thi
import com.fasterxml.jackson.core.type.TypeReference; // <-- Import TypeReference
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.URLEncoder; // <-- Import để mã hóa URL
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets; // <-- Import để mã hóa URL
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.CompletableFuture;

public class ApiService {
    private static final String BASE_URL = "http://localhost:8000/api";

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public ApiService() {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Lấy tất cả ca thi trong ngày.
     * Trả về CompletableFuture chứa ApiResponse đã được phân tích.
     */
    public CompletableFuture<ApiResponse<ExamSession>> fetchAllExamsForToday() { // <-- Sửa ở đây

        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String formatterDate = formatter.format(today);

        String apiUri = BASE_URL + "/exams?date=" + formatterDate;

        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(apiUri)).GET().build();

        // Tạo TypeReference để Jackson hiểu được cấu trúc generic
        TypeReference<ApiResponse<ExamSession>> typeRef = new TypeReference<>() {}; // <-- Thêm ở đây

        return sendRequestAndParseResponse(request, typeRef); // <-- Sửa ở đây
    }

    /**
     * Lấy ca thi theo phòng trong ngày.
     */
    public CompletableFuture<ApiResponse<ExamSession>> fetchExamsByRoomForToday(String roomName) { // <-- Sửa ở đây

        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String formatterDate = formatter.format(today);

        // Cải tiến: Mã hóa tên phòng để tránh lỗi URL (ví dụ: "Phòng A 1")
        String encodedRoomName = URLEncoder.encode(roomName.trim(), StandardCharsets.UTF_8);

        String apiUri = BASE_URL + "/exams?date=" + formatterDate + "&room=" + encodedRoomName;

        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(apiUri)).GET().build();

        // Tạo TypeReference
        TypeReference<ApiResponse<ExamSession>> typeRef = new TypeReference<>() {}; // <-- Thêm ở đây

        return sendRequestAndParseResponse(request, typeRef); // <-- Sửa ở đây
    }

    /**
     * Phương thức trợ giúp chung để gửi yêu cầu và phân tích JSON
     * Sử dụng <T> (Generic) để có thể tái sử dụng
     */
    private <T> CompletableFuture<ApiResponse<T>> sendRequestAndParseResponse(HttpRequest request, TypeReference<ApiResponse<T>> typeRef) { // <-- Sửa ở đây
        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(HttpResponse::body)
                .thenApply(jsonBody -> {
                    try {
                        // Sử dụng TypeReference để phân tích JSON
                        return objectMapper.readValue(jsonBody, typeRef); // <-- Sửa ở đây
                    } catch (Exception e) {
                        // In ra nội dung JSON khi gặp lỗi để dễ gỡ rối
                        System.err.println("JSON bị lỗi: " + jsonBody);
                        throw new RuntimeException("Lỗi phân tích JSON", e);
                    }
                });
    }
}