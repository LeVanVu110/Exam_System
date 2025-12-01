package com.example.studentapp.model;

public class ApiResponse<T> {
    // Thêm status để controller kiểm tra (ví dụ: "OK", "ERROR")
    private String status;
    private String message;

    // Đổi List<T> thành T.
    // Lý do: T có thể tự định nghĩa là List<ExamSession> hoặc ExamSession tùy
    // trường hợp.
    // Như vậy sẽ linh hoạt hơn nhiều.
    private T data;

    // Constructor mặc định
    public ApiResponse() {
    }

    // Constructor đầy đủ
    public ApiResponse(String status, String message, T data) {
        this.status = status;
        this.message = message;
        this.data = data;
    }

    // --- Getters & Setters ---
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}