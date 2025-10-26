package com.example.studentapp.service;


import com.example.studentapp.model.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.concurrent.CompletableFuture;
import com.example.studentapp.util.HttpClientUtil;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.nio.file.Files;
import java.net.URL;

import org.json.JSONObject;


public class ApiService {
    private static final String BASE_URL = "http://localhost:8006/api";


    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public ApiService() {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    public CompletableFuture<ApiResponse> fetchAllExams() {
        String apiUri = BASE_URL + "/exams";

        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(apiUri)).GET().build();

        return sendRequestAndParseResponse(request);
    }

    public CompletableFuture<ApiResponse> fetchExamsByRoom(String roomName) {
        String encodedRoomName = roomName.trim();

        String apiUri = BASE_URL + "/exams?room=" + encodedRoomName;

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
        
        
    public boolean login(String email, String password) {
        try {
            JSONObject body = new JSONObject();
            body.put("email", email);
            body.put("password", password);

            String response = HttpClientUtil.post(BASE_URL + "/login", body.toString());
            JSONObject json = new JSONObject(response);

            return json.has("token");
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // Phương thức nộp bài thi(upload)
    public boolean uploadExamFile(File file) {
        try {
            String boundary = "===" + System.currentTimeMillis() + "===";
            String LINE_FEED = "\r\n";

            URL url = new URL(BASE_URL + "/upload");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setUseCaches(false);
            connection.setDoOutput(true);
            connection.setDoInput(true);
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

            OutputStream outputStream = connection.getOutputStream();
            PrintWriter writer = new PrintWriter(new OutputStreamWriter(outputStream, "UTF-8"), true);

            // Gửi file
            String fileName = file.getName();
            writer.append("--" + boundary).append(LINE_FEED);
            writer.append("Content-Disposition: form-data; name=\"file\"; filename=\"" + fileName + "\"")
                    .append(LINE_FEED);
            writer.append("Content-Type: " + Files.probeContentType(file.toPath())).append(LINE_FEED);
            writer.append(LINE_FEED);
            writer.flush();

            Files.copy(file.toPath(), outputStream);
            outputStream.flush();

            writer.append(LINE_FEED).flush();
            writer.append("--" + boundary + "--").append(LINE_FEED);
            writer.close();

            // Nhận phản hồi từ server
            int status = connection.getResponseCode();
            if (status == HttpURLConnection.HTTP_OK) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                String line;
                StringBuilder response = new StringBuilder();
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();
                connection.disconnect();

                System.out.println("Response: " + response);
                return true;
            } else {
                System.out.println("Upload failed, status: " + status);
                return false;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

}
