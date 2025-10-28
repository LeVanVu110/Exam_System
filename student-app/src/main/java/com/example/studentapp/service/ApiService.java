package com.example.studentapp.service;


import com.example.studentapp.model.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
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

    public CompletableFuture<ApiResponse> fetchAllExamsForToday() {

        LocalDate today = LocalDate.now();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String formatterDate = formatter.format(today);

        String apiUri = BASE_URL + "/exams?date=" + formatterDate;

        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(apiUri)).GET().build();

        return sendRequestAndParseResponse(request);
    }

    public CompletableFuture<ApiResponse> fetchExamsByRoomForToday(String roomName) {

        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String formatterDate = formatter.format(today);

        String encodedRoomName = roomName.trim();

        String apiUri = BASE_URL + "/exams?date=" + formatterDate + "&room=" + encodedRoomName;

        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(apiUri)).GET().build();

        return sendRequestAndParseResponse(request);
    }

    private CompletableFuture<ApiResponse> sendRequestAndParseResponse(HttpRequest request) {
        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString()).thenApply(HttpResponse::body).thenApply(jsonBody -> {
            try {
                return objectMapper.readValue(jsonBody, ApiResponse.class);
            } catch (Exception e) {
                throw new RuntimeException("Lỗi phân tích JSON", e);
            }
        });
    }

}
