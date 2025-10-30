package com.example.studentapp.model;

import java.util.List;

/**
 * Lớp Response API chung, sử dụng Generics (T)
 * T có thể là RoomModel, ExamSession, Student, v.v.
 */
public class ApiResponse<T> { // Thêm <T> ở đây
    private String message;
    private int count;
    private List<T> data; // <-- Sửa ở đây

    // Getters and Setters

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

    public List<T> getData() { // <-- Sửa ở đây
        return data;
    }

    public void setData(List<T> data) { // <-- Sửa ở đây
        this.data = data;
    }
}