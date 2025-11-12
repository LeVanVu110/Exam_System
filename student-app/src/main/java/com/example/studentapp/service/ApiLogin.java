package com.example.studentapp.service;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
public class ApiLogin {
    private static final String UPLOAD_URL = "http://localhost:8000/api/exams/upload";

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
