package com.example.studentapp.service;

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
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import com.example.studentapp.model.ApiResponse;
import com.example.studentapp.model.ExamSession;
import com.example.studentapp.model.RoomDetailResponse;
import com.example.studentapp.model.RoomResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

public class ApiService {
    // Đảm bảo cổng khớp với server Laravel (8000 hoặc 8006)
    private static final String BASE_URL = "http://127.0.0.1:8000/api";

    private String getToken() {
        return TokenManager.getInstance().getBearerToken();
    }

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public ApiService() {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    // ========================================================================
    // 1. NHÓM CHỨC NĂNG: UPLOAD BÀI THI
    // ========================================================================
    public CompletableFuture<Boolean> uploadExamCollection(
            File zipFile, int examSessionId, String roomName, String examTime,
            int studentCount, String cbct1, String cbct2, String notes) {

        return CompletableFuture.supplyAsync(() -> {
            String boundary = "===" + System.currentTimeMillis() + "===";
            String apiUrl = BASE_URL + "/exam-submissions/upload";

            try {
                URL url = new URL(apiUrl);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setDoOutput(true);
                conn.setRequestMethod("POST");
                // Thêm Token vào Upload request
                conn.setRequestProperty("Authorization",  getToken());
                conn.setRequestProperty("Accept", "application/json");
                conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

                try (DataOutputStream out = new DataOutputStream(conn.getOutputStream())) {
                    addFormField(out, boundary, "examSessionId", String.valueOf(examSessionId));
                    addFormField(out, boundary, "roomName", roomName != null ? roomName : "");
                    addFormField(out, boundary, "examTime", examTime != null ? examTime : "");
                    addFormField(out, boundary, "studentCount", String.valueOf(studentCount));
                    addFormField(out, boundary, "cbct1", cbct1 != null ? cbct1 : "");
                    addFormField(out, boundary, "cbct2", cbct2 != null ? cbct2 : "");
                    addFormField(out, boundary, "notes", notes != null ? notes : "");

                    out.writeBytes("--" + boundary + "\r\n");
                    out.writeBytes("Content-Disposition: form-data; name=\"examFile\"; filename=\"" + zipFile.getName()
                            + "\"\r\n");
                    out.writeBytes("Content-Type: application/zip\r\n\r\n");
                    Files.copy(zipFile.toPath(), out);
                    out.writeBytes("\r\n");
                    out.writeBytes("--" + boundary + "--\r\n");
                    out.flush();
                }

                int responseCode = conn.getResponseCode();
                System.out.println("Upload status: " + responseCode);
                return responseCode == 200 || responseCode == 201;

            } catch (Exception e) {
                e.printStackTrace();
                return false;
            }
        });
    }

    private void addFormField(DataOutputStream out, String boundary, String name, String value) throws IOException {
        out.writeBytes("--" + boundary + "\r\n");
        out.writeBytes("Content-Disposition: form-data; name=\"" + name + "\"\r\n\r\n");
        out.write(value.getBytes(StandardCharsets.UTF_8));
        out.writeBytes("\r\n");
    }

    // ========================================================================
    // 2. NHÓM CHỨC NĂNG: LẤY DỮ LIỆU CŨ (Trả về RoomResponse)
    // ========================================================================

    public CompletableFuture<RoomResponse> fetchAllExamsForToday() {
        String apiUri = BASE_URL + "/exam-sessions/today";
        // Đã thêm Token
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUri))
                .header("Authorization",  getToken())
                .header("Accept", "application/json")
                .GET()
                .build();
        return sendRequestAndParseResponse(request);
    }

    public CompletableFuture<RoomResponse> fetchExamsByRoomForToday(String roomName) {
        String encodedRoom = roomName.replace(" ", "%20");
        String apiUri = BASE_URL + "/exam-sessions/search?room=" + encodedRoom;
        // Đã thêm Token
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUri))
                .header("Authorization",  getToken())
                .header("Accept", "application/json")
                .GET()
                .build();
        return sendRequestAndParseResponse(request);
    }

    public CompletableFuture<RoomResponse> searchExamsForRoom(String roomName) {
        return fetchExamsByRoomForToday(roomName);
    }

    public CompletableFuture<RoomDetailResponse> fetchExamById(int examId) {
        String apiUri = BASE_URL + "/exam-sessions/" + examId;
        // Đã thêm Token
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUri))
                .header("Authorization",  getToken())
                .header("Accept", "application/json")
                .GET()
                .build();

        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(HttpResponse::body)
                .thenApply(jsonBody -> {
                    try {
                        return objectMapper.readValue(jsonBody, RoomDetailResponse.class);
                    } catch (Exception e) {
                        return new RoomDetailResponse();
                    }
                });
    }

    // ========================================================================
    // 3. NHÓM CHỨC NĂNG: QUẢN LÝ (Giả lập)
    // ========================================================================

    public CompletableFuture<Boolean> createExamSession(ExamSession session) {
        System.out.println("Đang tạo ca thi: " + session.getMaHP());
        return CompletableFuture.completedFuture(true);
    }

    public CompletableFuture<Boolean> updateExamSession(ExamSession session) {
        System.out.println("Đang cập nhật ca thi: " + session.getMaHP());
        return CompletableFuture.completedFuture(true);
    }

    public CompletableFuture<Boolean> deleteExamSession(String id) {
        System.out.println("Đang xóa ca thi ID: " + id);
        return CompletableFuture.completedFuture(true);
    }

    public CompletableFuture<Boolean> updateProctor(String maCaThi, String tenGiamThi) {
        System.out.println("Đang cập nhật giám thị " + tenGiamThi + " cho ca " + maCaThi);
        return CompletableFuture.completedFuture(true);
    }

    // ========================================================================
    // 4. KHU VỰC BỔ SUNG (Dùng cho QuanLyLichThi & LichThiPDT - Trả về ApiResponse)
    // ========================================================================

    /**
     * Lấy danh sách ca thi trả về ApiResponse<List>
     */
    public CompletableFuture<ApiResponse<List<ExamSession>>> fetchAllExamsList() {
        String apiUri = BASE_URL + "/exam-sessions";
        // ✅ ĐÃ SỬA: Thêm Header Authorization
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUri))
                .header("Authorization",  getToken())
                .header("Accept", "application/json")
                .GET()
                .build();
        return sendRequestAndParseList(request);
    }

    /**
     * Tìm kiếm theo phòng trả về ApiResponse<List>
     */
    public CompletableFuture<ApiResponse<List<ExamSession>>> fetchExamsByRoomList(String roomName) {
        String encodedRoom = roomName.replace(" ", "%20");
        String apiUri = BASE_URL + "/exam-sessions/search?room=" + encodedRoom;
        // ✅ ĐÃ SỬA: Thêm Header Authorization
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUri))
                .header("Authorization",  getToken())
                .header("Accept", "application/json")
                .GET()
                .build();
        return sendRequestAndParseList(request);
    }

    public CompletableFuture<ApiResponse<ExamSession>> createExamSessionApi(ExamSession session) {
        System.out.println("Mock API: Create Session " + session.getMaHP());
        return CompletableFuture.completedFuture(new ApiResponse<>("OK", "OK", session));
    }

    public CompletableFuture<ApiResponse<ExamSession>> updateExamSessionApi(ExamSession session) {
        System.out.println("Mock API: Update Session " + session.getMaHP());
        return CompletableFuture.completedFuture(new ApiResponse<>("OK", "OK", session));
    }

    // ========================================================================
    // HÀM HỖ TRỢ PARSE JSON
    // ========================================================================

    private CompletableFuture<RoomResponse> sendRequestAndParseResponse(HttpRequest request) {
        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(HttpResponse::body)
                .thenApply(jsonBody -> {
                    try {
                        return objectMapper.readValue(jsonBody, RoomResponse.class);
                    } catch (Exception e) {
                        return new RoomResponse();
                    }
                });
    }

    private CompletableFuture<ApiResponse<List<ExamSession>>> sendRequestAndParseList(HttpRequest request) {
        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(HttpResponse::body)
                .thenApply(jsonBody -> {
                    // In ra để debug xem server trả về cái gì
                    System.out.println("SERVER TRẢ VỀ: " + jsonBody);

                    List<ExamSession> list = new ArrayList<>();
                    Gson gson = new Gson();
                    try {
                        JsonElement element = gson.fromJson(jsonBody, JsonElement.class);
                        JsonArray jsonArray = null;

                        // Xử lý trường hợp trả về Object {data: [...]} hoặc Array [...]
                        if (element.isJsonObject() && element.getAsJsonObject().has("data")) {
                            jsonArray = element.getAsJsonObject().getAsJsonArray("data");
                        } else if (element.isJsonArray()) {
                            jsonArray = element.getAsJsonArray();
                        }

                        if (jsonArray != null) {
                            for (JsonElement item : jsonArray) {
                                JsonObject obj = item.getAsJsonObject();
                                ExamSession s = new ExamSession();

                                // Mapping dữ liệu
                                s.setMaCaThi(getJsonString(obj, "exam_session_id"));

                                String maHP = getJsonString(obj, "class_code");
                                if (maHP.isEmpty())
                                    maHP = getJsonString(obj, "exam_code");
                                s.setMaHP(maHP);

                                s.setTenHP(getJsonString(obj, "subject_name"));
                                s.setTenMonHoc(getJsonString(obj, "subject_name"));
                                s.setLopSV(getJsonString(obj, "class_code"));
                                s.setPhongThi(getJsonString(obj, "exam_room"));
                                s.setNgayThi(getJsonString(obj, "exam_date"));

                                String start = getJsonString(obj, "exam_start_time");
                                String end = getJsonString(obj, "exam_end_time");
                                if (start.length() > 5)
                                    start = start.substring(0, 5);
                                if (end.length() > 5)
                                    end = end.substring(0, 5);
                                s.setGioThi(start + " - " + end);

                                s.setSoSV(getJsonString(obj, "total_students"));

                                String hinhThuc = getJsonString(obj, "exam_method");
                                if (hinhThuc.isEmpty())
                                    hinhThuc = "Tự luận";
                                s.setHinhThucThi(hinhThuc);

                                String gv1 = getJsonString(obj, "teacher1_name");
                                String gv2 = getJsonString(obj, "teacher2_name");
                                String cbct = gv1 + (gv2.isEmpty() ? "" : ", " + gv2);
                                s.setCanBoCoiThi(cbct);

                                s.setTrangThai(getJsonString(obj, "status"));
                                s.setSoBaiNop("0");
                                s.setSoMayTrong("0");

                                list.add(s);
                            }
                        }
                        return new ApiResponse<>("OK", "OK", list);
                    } catch (Exception e) {
                        e.printStackTrace();
                        // Trả về list rỗng nếu lỗi parse để App không bị crash
                        return new ApiResponse<>("ERROR", "Lỗi Parse JSON: " + e.getMessage(), new ArrayList<>());
                    }
                });
    }

    private String getJsonString(JsonObject obj, String key) {
        if (obj.has(key) && !obj.get(key).isJsonNull()) {
            return obj.get(key).getAsString();
        }
        return "";
    }
}