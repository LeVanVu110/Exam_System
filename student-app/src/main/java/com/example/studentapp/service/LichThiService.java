package com.example.studentapp.service;

// =================================================================
// ĐÂY LÀ PHẦN IMPORT BỊ THIẾU
// (Bạn phải copy tất cả các dòng này)
// =================================================================
import com.example.studentapp.model.LichThi;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import com.google.gson.JsonElement;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializer;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonParseException;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonSerializationContext;

import java.lang.reflect.Type;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.util.List;
// =================================================================
// KẾT THÚC PHẦN IMPORT
// =================================================================


public class LichThiService {

    // URL API của bạn
    private static final String API_URL = "http://localhost:3001/api/exams/schedule";

    // Các dòng này sẽ hết đỏ khi bạn thêm import
    private final HttpClient client = HttpClient.newHttpClient();
    
    // Cấu hình Gson để hiểu định dạng ngày LocalDate
    private final Gson gson = new GsonBuilder()
            .registerTypeAdapter(LocalDate.class, new LocalDateAdapter())
            .create();

    /**
     * Gọi API để lấy danh sách Lịch Thi
     */
    public List<LichThi> getLichThiTuApi() throws Exception {
        
        // Các dòng này sẽ hết đỏ khi bạn thêm import
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(API_URL))
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Lỗi gọi API: " + response.statusCode());
        }

        String jsonBody = response.body();

        // Các dòng này sẽ hết đỏ khi bạn thêm import
        Type listType = new TypeToken<List<LichThi>>(){}.getType();
        return gson.fromJson(jsonBody, listType);
    }
}

/**
 * =====================================================================
 * CLASS PHỤ TRỢ (BẮT BUỘC)
 * Để class này ở cuối file, bên ngoài class LichThiService
 * =====================================================================
 */
class LocalDateAdapter implements JsonSerializer<LocalDate>, JsonDeserializer<LocalDate> {

    @Override
    public LocalDate deserialize(JsonElement json, Type typeOfT,
                                 JsonDeserializationContext context)
            throws JsonParseException {
        // Lấy chuỗi từ JSON và chuyển thành LocalDate
        return LocalDate.parse(json.getAsString());
    }

    @Override
    public JsonElement serialize(LocalDate src, Type typeOfSrc,
                                                 JsonSerializationContext context) {
        // Chuyển LocalDate thành chuỗi để gửi đi (nếu cần)
        return new JsonPrimitive(src.toString());
    }
}