package com.example.studentapp.service;


import com.example.studentapp.model.RoomResponse;
import com.example.studentapp.model.RoomDetailResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.concurrent.CompletableFuture;


public class ApiService {
    private static final String BASE_URL = "http://localhost:8000/api";


    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public ApiService() {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
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
