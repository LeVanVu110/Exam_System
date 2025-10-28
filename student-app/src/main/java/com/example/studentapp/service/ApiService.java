package com.example.studentapp.service;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

public class ApiService {

    // =================================================================
    // HÀM LẤY LỊCH THI (GET) - DÙNG CHO MOCKOON /template
    // =================================================================
    private static final String TEMPLATE_URL = "http://localhost:3000/template";

    /**
     * Lấy dữ liệu lịch thi từ API Mockoon (GET).
     * @param total Số lượng mục lịch thi muốn lấy (API của bạn mặc định là 25)
     * @return Một chuỗi JSON chứa dữ liệu lịch thi, hoặc null nếu có lỗi.
     */
    public static String getExamSchedule(int total) {
        // Thêm tham số ?total=... vào URL
        String urlString = TEMPLATE_URL + "?total=" + total;
        StringBuilder response = new StringBuilder();

        try {
            URL url = new URL(urlString);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            
            // Đặt phương thức là GET
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Accept", "application/json");
            conn.setConnectTimeout(5000); // Timeout 5 giây
            conn.setReadTimeout(5000);

            int responseCode = conn.getResponseCode();

            if (responseCode == HttpURLConnection.HTTP_OK) { // 200 OK
                // Đọc dữ liệu trả về
                try (BufferedReader in = new BufferedReader(
                        new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                    String inputLine;
                    while ((inputLine = in.readLine()) != null) {
                        response.append(inputLine);
                    }
                }
                return response.toString();
            } else {
                // In lỗi nếu server trả về 404, 500, 405 (Method Not Allowed)...
                System.err.println("GET request không thành công. Mã lỗi: " + responseCode);
                // Đọc thông báo lỗi từ server (nếu có)
                try (BufferedReader in = new BufferedReader(
                        new InputStreamReader(conn.getErrorStream(), StandardCharsets.UTF_8))) {
                    String inputLine;
                    while ((inputLine = in.readLine()) != null) {
                        System.err.println("Lỗi từ server: " + inputLine);
                    }
                }
                return null;
            }
        } catch (Exception e) {
            // Lỗi kết nối (Connection refused, Tường lửa, Server Mockoon chưa chạy)
            e.printStackTrace(); 
            return null;
        }
    }


    // =================================================================
    // HÀM UPLOAD FILE (POST) - DÙNG CHO API UPLOAD
    // =================================================================
    // Hãy trỏ URL này về đúng API upload của bạn
    private static final String UPLOAD_URL = "http://localhost:3001/path"; 

    public static boolean uploadExamFile(File file) {
        try {
            String boundary = Long.toHexString(System.currentTimeMillis());
            HttpURLConnection conn = (HttpURLConnection) new URL(UPLOAD_URL).openConnection();
            conn.setDoOutput(true);
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

            try (OutputStream output = conn.getOutputStream();
                 PrintWriter writer = new PrintWriter(new OutputStreamWriter(output, "UTF-8"), true)) {
                
                writer.append("--").append(boundary).append("\r\n");
                writer.append("Content-Disposition: form-data; name=\"file\"; filename=\"")
                        .append(file.getName()).append("\"\r\n");
                writer.append("Content-Type: ").append(Files.probeContentType(file.toPath())).append("\r\n\r\n").flush();
                
                Files.copy(file.toPath(), output);
                output.flush();
                
                writer.append("\r\n--").append(boundary).append("--\r\n").flush();
            }

            return conn.getResponseCode() == HttpURLConnection.HTTP_OK;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}