package com.example.studentapp.model;

import java.util.List;

public class ApiRespone {
    private String message;
    private int count;

    // Tên biến "data" này PHẢI KHỚP với key "data" trong JSON
    private List<RoomModel> data;

    // --- Bắt buộc phải có Getters và Setters
    // (Jackson/Gson sẽ dùng chúng để gán giá trị)

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public List<RoomModel> getData() {
        return data;
    }

    public void setData(List<RoomModel> data) {
        this.data = data;
    }
}
