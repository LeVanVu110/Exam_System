package com.example.studentapp.service;

import com.example.studentapp.model.ApiResponse;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import java.util.ArrayList;
import java.util.List; // Tuấn Thêm import 

import com.example.studentapp.model.ExamSession;
import com.example.studentapp.model.RoomDetailResponse;
import com.example.studentapp.model.RoomResponse;
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
    // Đảm bảo cổng 8000 khớp với server Laravel đang chạy
    private static final String BASE_URL = "http://localhost:8006/api";

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public ApiService() {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    // ========================================================================
    // 1. NHÓM CHỨC NĂNG: UPLOAD BÀI THI (Cho UploadController)
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
    // 2. NHÓM CHỨC NĂNG: LẤY DỮ LIỆU (Cho Home, KiemTraCaThi)
    // ========================================================================

    // Lấy tất cả ca thi hôm nay
    public CompletableFuture<RoomResponse> fetchAllExamsForToday() {
        String apiUri = BASE_URL + "/exam-sessions/today";
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(apiUri)).GET().build();
        return sendRequestAndParseResponse(request);
    }

    // Tìm kiếm ca thi theo phòng (cho KiemTraCaThiController)
    public CompletableFuture<RoomResponse> fetchExamsByRoomForToday(String roomName) {
        // Cần mã hóa URL nếu tên phòng có dấu cách
        String encodedRoom = roomName.replace(" ", "%20");
        String apiUri = BASE_URL + "/exam-sessions/search?room=" + encodedRoom;
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(apiUri)).GET().build();
        return sendRequestAndParseResponse(request);
    }

    // Tìm kiếm (Alias cũ, giữ lại để tương thích ngược)
    public CompletableFuture<RoomResponse> searchExamsForRoom(String roomName) {
        return fetchExamsByRoomForToday(roomName);
    }

    // Lấy chi tiết ca thi theo ID
    public CompletableFuture<RoomDetailResponse> fetchExamById(int examId) {
        String apiUri = BASE_URL + "/exam-sessions/" + examId;
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(apiUri)).GET().build();

        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(HttpResponse::body)
                .thenApply(jsonBody -> {
                    try {
                        return objectMapper.readValue(jsonBody, RoomDetailResponse.class);
                    } catch (Exception e) {
                        return new RoomDetailResponse(); // Trả về rỗng để không crash
                    }
                });
    }

    // ========================================================================
    // 3. NHÓM CHỨC NĂNG: QUẢN LÝ (Cho QuanLyLichThi, LichThiPDT)
    // ========================================================================

    // Tạo mới ca thi
    public CompletableFuture<Boolean> createExamSession(ExamSession session) {
        // TODO: Gửi POST request lên Laravel
        System.out.println("Đang tạo ca thi: " + session.getMaHP());
        return CompletableFuture.completedFuture(true);
    }

    // Cập nhật ca thi
    public CompletableFuture<Boolean> updateExamSession(ExamSession session) {
        // TODO: Gửi PUT request lên Laravel
        System.out.println("Đang cập nhật ca thi: " + session.getMaHP());
        return CompletableFuture.completedFuture(true);
    }

    // Xóa ca thi
    public CompletableFuture<Boolean> deleteExamSession(String id) {
        // TODO: Gửi DELETE request lên Laravel
        System.out.println("Đang xóa ca thi ID: " + id);
        return CompletableFuture.completedFuture(true);
    }

    // Cập nhật giám thị
    public CompletableFuture<Boolean> updateProctor(String maCaThi, String tenGiamThi) {
        System.out.println("Đang cập nhật giám thị " + tenGiamThi + " cho ca " + maCaThi);
        return CompletableFuture.completedFuture(true);
    }

    // ========================================================================
    // 4. HÀM HỖ TRỢ CHUNG
    // ========================================================================
    private CompletableFuture<RoomResponse> sendRequestAndParseResponse(HttpRequest request) {
        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(HttpResponse::body)
                .thenApply(jsonBody -> {
                    try {
                        return objectMapper.readValue(jsonBody, RoomResponse.class);
                    } catch (Exception e) {
                        // Trả về đối tượng rỗng nếu lỗi parse JSON
                        return new RoomResponse();
                    }
                });
    }

    // ========================================================================
    // KHU VỰC BỔ SUNG (Dùng cho QuanLyLichThi & LichThiPDT - Trả về ApiResponse)
    // ========================================================================

    /**
     * Lấy danh sách ca thi trả về ApiResponse<List> (Thay thế fetchAllExamsForToday
     * cũ)
     */
    public CompletableFuture<ApiResponse<List<ExamSession>>> fetchAllExamsList() {
        String apiUri = BASE_URL + "/exam-sessions";
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(apiUri)).GET().build();
        return sendRequestAndParseList(request);
    }

    /**
     * Tìm kiếm theo phòng trả về ApiResponse<List> (Thay thế
     * fetchExamsByRoomForToday cũ)
     */
    public CompletableFuture<ApiResponse<List<ExamSession>>> fetchExamsByRoomList(String roomName) {
        String encodedRoom = roomName.replace(" ", "%20");
        String apiUri = BASE_URL + "/exam-sessions/search?room=" + encodedRoom;
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(apiUri)).GET().build();
        return sendRequestAndParseList(request);
    }

    /**
     * Tạo mới ca thi (Trả về ApiResponse - Khác hàm cũ trả về Boolean)
     */
    public CompletableFuture<ApiResponse<ExamSession>> createExamSessionApi(ExamSession session) {
        // TODO: Gửi POST request thực tế. Ở đây giả lập thành công.
        System.out.println("Mock API: Create Session " + session.getMaHP());
        return CompletableFuture.completedFuture(new ApiResponse<>("OK", "OK", session));
    }

    /**
     * Cập nhật ca thi (Trả về ApiResponse - Khác hàm cũ trả về Boolean)
     */
    public CompletableFuture<ApiResponse<ExamSession>> updateExamSessionApi(ExamSession session) {
        System.out.println("Mock API: Update Session " + session.getMaHP());
        return CompletableFuture.completedFuture(new ApiResponse<>("OK", "OK", session));
    }

    // --- HÀM HỖ TRỢ PARSE JSON BẰNG GSON (ĐÃ SỬA MAPPING CHO KHỚP JSON) ---
    private CompletableFuture<ApiResponse<List<ExamSession>>> sendRequestAndParseList(HttpRequest request) {
        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(HttpResponse::body)
                .thenApply(jsonBody -> {
                    List<ExamSession> list = new ArrayList<>();
                    Gson gson = new Gson();
                    try {
                        JsonElement element = gson.fromJson(jsonBody, JsonElement.class);
                        JsonArray jsonArray = null;

                        if (element.isJsonObject() && element.getAsJsonObject().has("data")) {
                            jsonArray = element.getAsJsonObject().getAsJsonArray("data");
                        } else if (element.isJsonArray()) {
                            jsonArray = element.getAsJsonArray();
                        }

                        if (jsonArray != null) {
                            for (JsonElement item : jsonArray) {
                                JsonObject obj = item.getAsJsonObject();
                                ExamSession s = new ExamSession();

                                // === SỬA PHẦN NÀY ĐỂ KHỚP VỚI JSON BACKEND ===

                                // 1. ID Ca thi
                                s.setMaCaThi(getJsonString(obj, "exam_session_id")); // JSON là exam_session_id

                                // 2. Mã Học Phần (JSON thiếu subject_code, lấy tạm class_code hoặc exam_code)
                                String maHP = getJsonString(obj, "class_code");
                                if (maHP.isEmpty())
                                    maHP = getJsonString(obj, "exam_code");
                                s.setMaHP(maHP);

                                // 3. Tên Môn
                                s.setTenHP(getJsonString(obj, "subject_name"));
                                s.setTenMonHoc(getJsonString(obj, "subject_name"));

                                // 4. Lớp & Phòng
                                s.setLopSV(getJsonString(obj, "class_code"));
                                s.setPhongThi(getJsonString(obj, "exam_room")); // JSON là exam_room

                                // 5. Ngày thi
                                s.setNgayThi(getJsonString(obj, "exam_date"));

                                // 6. Giờ thi (Ghép Start - End)
                                String start = getJsonString(obj, "exam_start_time");
                                String end = getJsonString(obj, "exam_end_time");
                                // Cắt chuỗi HH:mm:ss thành HH:mm
                                if (start.length() > 5)
                                    start = start.substring(0, 5);
                                if (end.length() > 5)
                                    end = end.substring(0, 5);
                                s.setGioThi(start + " - " + end);

                                // 7. Số lượng & Hình thức
                                s.setSoSV(getJsonString(obj, "total_students"));

                                // Nếu không có exam_method, lấy tạm status
                                String hinhThuc = getJsonString(obj, "exam_method");
                                if (hinhThuc.isEmpty())
                                    hinhThuc = "Tự luận";
                                s.setHinhThucThi(hinhThuc);

                                // 8. Cán bộ coi thi (Ghép tên GV1 + GV2)
                                String gv1 = getJsonString(obj, "teacher1_name");
                                String gv2 = getJsonString(obj, "teacher2_name");
                                String cbct = gv1 + (gv2.isEmpty() ? "" : ", " + gv2);
                                s.setCanBoCoiThi(cbct);

                                // 9. Trạng thái & Thống kê
                                s.setTrangThai(getJsonString(obj, "status"));
                                s.setSoBaiNop("0"); // Mặc định
                                s.setSoMayTrong("0"); // Mặc định

                                list.add(s);
                            }
                        }
                        return new ApiResponse<>("OK", "OK", list);
                    } catch (Exception e) {
                        e.printStackTrace();
                        return new ApiResponse<>("ERROR", e.getMessage(), new ArrayList<>());
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