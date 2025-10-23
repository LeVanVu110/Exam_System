package com.example.studentapp.service;

import com.example.studentapp.model.ExamStatus;
import com.example.studentapp.model.LichThi;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.*;
import java.lang.reflect.Type;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.util.Collections;
import java.util.List;

public class ApiService {

    // URL đã được trỏ tới server Mockoon để test
    private static final String BASE_URL = "http://localhost:3000"; 
    
    // Các đường dẫn API con
    private static final String UPLOAD_ENDPOINT = "/api/exams/upload";
    private static final String SCHEDULE_ENDPOINT = "/api/exams/schedule";
    private static final String STATUS_ENDPOINT = "/api/exam-status/"; // Ví dụ: /api/exam-status/123

    /**
     * Lấy trạng thái hiện tại của một kỳ thi.
     * @param examId ID của kỳ thi cần kiểm tra.
     * @return đối tượng ExamStatus, hoặc null nếu có lỗi.
     */
    public static ExamStatus getExamStatus(String examId) {
        try {
            URL url = new URL(BASE_URL + STATUS_ENDPOINT + examId);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);

            if (conn.getResponseCode() == HttpURLConnection.HTTP_OK) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                String response = reader.readLine();
                reader.close();
                
                return new Gson().fromJson(response, ExamStatus.class);
            }
            conn.disconnect();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Phương thức để lấy danh sách lịch thi từ server.
     * @return Danh sách các đối tượng LichThi, hoặc một danh sách rỗng nếu có lỗi.
     */
    public static List<LichThi> getLichThi() {
        try {
            URL url = new URL(BASE_URL + SCHEDULE_ENDPOINT);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);

            if (conn.getResponseCode() == HttpURLConnection.HTTP_OK) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();

                Gson gson = new Gson();
                Type listType = new TypeToken<List<LichThi>>(){}.getType();
                return gson.fromJson(response.toString(), listType);
            }
            conn.disconnect();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return Collections.emptyList(); 
    }

    /**
     * Phương thức upload file bài thi của bạn.
     */
    public static boolean uploadExamFile(File file) {
        String boundary = Long.toHexString(System.currentTimeMillis());
        try {
            URL url = new URL(BASE_URL + UPLOAD_ENDPOINT);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setDoOutput(true);
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

            try (OutputStream output = conn.getOutputStream();
                 PrintWriter writer = new PrintWriter(new OutputStreamWriter(output, "UTF-8"), true)) {

                writer.append("--").append(boundary).append("\r\n");
                writer.append("Content-Disposition: form-data; name=\"file\"; filename=\"").append(file.getName()).append("\"\r\n");
                writer.append("Content-Type: ").append(Files.probeContentType(file.toPath())).append("\r\n\r\n").flush();
                Files.copy(file.toPath(), output);
                output.flush();
                writer.append("\r\n").flush();
                writer.append("--").append(boundary).append("--").append("\r\n").flush();
            }
            return conn.getResponseCode() == HttpURLConnection.HTTP_OK;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}